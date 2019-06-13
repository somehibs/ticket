<?php
use Respect\Validation\Validator as DataValidator;
DataValidator::with('CustomValidations', true);

/**
 * @api {post} /ticket/comment Comment ticket
 * @apiVersion 4.1.0
 *
 * @apiName Comment ticket
 *
 * @apiGroup Ticket
 *
 * @apiDescription This path comments a ticket.
 *
 * @apiPermission user
 *
 * @apiParam {String} content Content of the comment.
 * @apiParam {Number} ticketNumber The number of the ticket to comment.
 *
 * @apiUse NO_PERMISSION
 * @apiUse INVALID_CONTENT
 * @apiUse INVALID_TICKET
 * @apiUse INVALID_TOKEN
 *
 * @apiSuccess {Object} data Empty object
 *
 */

class CommentController extends Controller {
    const PATH = '/comment';
    const METHOD = 'POST';

    private $ticket;
    private $content;

    public function validations() {
        $session = Session::getInstance();

        if (Controller::isUserSystemEnabled() || Controller::isStaffLogged()) {
            return [
                'permission' => 'user',
                'requestData' => [
                    'content' => [
                        'validation' => DataValidator::length(20, 5000),
                        'error' => ERRORS::INVALID_CONTENT
                    ],
                    'ticketNumber' => [
                        'validation' => DataValidator::validTicketNumber(),
                        'error' => ERRORS::INVALID_TICKET
                    ]
                ]
            ];
        } else {
            return [
                'permission' => 'any',
                'requestData' => [
                    'content' => [
                        'validation' => DataValidator::length(20, 5000),
                        'error' => ERRORS::INVALID_CONTENT
                    ],
                    'ticketNumber' => [
                        'validation' => DataValidator::equals($session->getTicketNumber()),
                        'error' => ERRORS::INVALID_TICKET
                    ],
                    'csrf_token' => [
                        'validation' => DataValidator::equals($session->getToken()),
                        'error' => ERRORS::INVALID_TOKEN
                    ]
                ]
            ];
        }
    }

    public function handler() {
        $this->requestData();
        $ticketAuthor = $this->ticket->authorToArray();
	$isAuthor = 0;
	$isOwner = 0;
	if (Controller::getLoggedUser() instanceof NullDataStore) {
		$sessionTicket = Session::getInstance()->getTicketNumber();
		if ($sessionTicket !== $this->ticket->ticket_number) {
			return;
		} else {
			$isAuthor = 1;
		}
	} else {
	        $isAuthor = $this->ticket->isAuthor(Controller::getLoggedUser());
	        $isOwner = $this->ticket->isOwner(Controller::getLoggedUser());
	}

	if (!$isOwner) {
		// Need to set the owner to myself. Don't bother emailing the user.
		$loggedUser = Controller::getLoggedUser();
		$loggedUser->sharedTicketList->add($this->ticket);
		$this->ticket->owner = $loggedUser;
		$this->ticket->unread = !$this->ticket->isAuthor($loggedUser);
		$event = Ticketevent::getEvent(Ticketevent::ASSIGN);
		$event->setProperties(array('authorStaff' => $loggedUser, 'date' => Date::getCurrentDate()));
		$this->ticket->addEvent($event);
		$this->ticket->store();
		$loggedUser->store();
		$isOwner = 1;
	}

        if(!$isOwner && !$isAuthor && ($this->internal === "false")) {
		error_log("Permission denied ".$isOwner."|".$isAuthor."|".$this->internal);
		throw new Exception(ERRORS::NO_PERMISSION);
        }

        $this->storeComment();

        if($isAuthor && $this->ticket->owner && $this->internal === "false") {
          $this->sendMail([
            'email' => $this->ticket->owner->email,
            'name' => $this->ticket->owner->name,
            'staff' => true
          ]);
        } else {
		if ($this->internal === "false" && !$isAuthor) {
	          $this->sendMail($ticketAuthor);
		}
        }

        Log::createLog('COMMENT', $this->ticket->ticketNumber);

        Response::respondSuccess();
    }

    private function requestData() {
        $ticketNumber = Controller::request('ticketNumber');
        $this->ticket = Ticket::getByTicketNumber($ticketNumber);
        $this->content = Controller::request('content', true);
        $this->internal = Controller::request('internal');
        $this->commentId = Controller::request('commentId');
    }

    private function storeComment() {
        $fileUploader = $this->uploadFile();

	if ($this->internal !== "false") {
	        $comment = Ticketevent::getEvent(Ticketevent::INTERNAL_COMMENT);
	} else {
	        $comment = Ticketevent::getEvent(Ticketevent::COMMENT);
	}
        $comment->setProperties(array(
            'content' => $this->content,
            'file' => ($fileUploader instanceof FileUploader) ? $fileUploader->getFileName() : null,
            'date' => Date::getCurrentDate()
        ));

        if(Controller::isStaffLogged()) {
            $this->ticket->unread = !$this->ticket->isAuthor(Controller::getLoggedUser());
            $this->ticket->unreadStaff = !$this->ticket->isOwner(Controller::getLoggedUser());
            $comment->authorStaff = Controller::getLoggedUser();
        } else if(Controller::isUserSystemEnabled()) {
            $this->ticket->unreadStaff = true;
            $comment->authorUser = Controller::getLoggedUser();
	}

        $this->ticket->addEvent($comment);
        $this->ticket->store();
    }

    private function sendMail($recipient) {
        $mailSender = MailSender::getInstance();

        $email = $recipient['email'];
        $name = $recipient['name'];
        $isStaff = isset($recipient['staff']) && $recipient['staff'];

        $url = Setting::getSetting('url')->getValue();

        if(!Controller::isUserSystemEnabled() && !$isStaff) {
          $url .= '/check-ticket/' . $this->ticket->ticketNumber;
          $url .= '/' . $email;
        }

        $mailSender->setTemplate(MailTemplate::TICKET_RESPONDED, [
            'to' => $email,
            'name' => $name,
            'title' => $this->ticket->title,
            'ticketNumber' => $this->ticket->ticketNumber,
            'url' => $url
        ]);

        $mailSender->send();
    }
}
