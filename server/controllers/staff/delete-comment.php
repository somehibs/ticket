<?php
use Respect\Validation\Validator as DataValidator;
DataValidator::with('CustomValidations', true);

/**
 * @api {post} /staff/delete-comment Delete internal comment
 * @apiVersion 4.1.0
 *
 * @apiName Delete comment
 *
 * @apiGroup Staff
 *
 * @apiDescription This path deletes an internal comment.
 *
 * @apiPermission staff
 *
 * @apiParam {Number} id Id of the internal comment to delete.
 *
 * @apiUse NO_PERMISSION
 * 
 * @apiSuccess {Object} data Empty object
 *
 */

class DeleteCommentController extends Controller {
    const PATH = '/delete-comment';
    const METHOD = 'POST';

    public function validations() {
        return [
            'permission' => 'staff_1',
            'requestData' => [
                'id' => [
                    'validation' => DataValidator::dataStoreId('ticketevent'),
                    'error' => ERRORS::INVALID_NAME
                ]
            ]
        ];
    }

    public function handler() {
        $event = Ticketevent::getDataStore(Controller::request('id'));
	if ($event->type === 'INTERNAL_COMMENT') {
	        $event->delete();
	}

        Log::createLog('DELETE_COMMENT', null);
        
        Response::respondSuccess();
    }
}
