import json
import dataclasses as dc
from logging import getLogger
import falcon
from py_interview.common.service.comment_service import CommentService

class CommentResource:
    def __init__(self, comment_service: CommentService):
        self._comment_service = comment_service
        self._logger = getLogger(self.__module__)

    def on_get(self, req, resp, event_id: str):
        offset = int(req.get_param('offset', default=0))
        limit = int(req.get_param('limit', default=5))
        comments = self._comment_service.get_comments(event_id=event_id, offset=offset, limit=limit)
        resp.status = falcon.HTTP_200
        resp.media = [dc.asdict(comment) for comment in comments]

    def on_post(self, req, resp, event_id: str):
        post_body = json.load(req.bounded_stream)
        uqid = post_body.get('uqid', None)
        content = post_body.get('content', None)

        data = self._comment_service.create_or_update_comment(uqid=uqid, event_id=event_id, content=content)
        resp.status = falcon.HTTP_200
        resp.media = dc.asdict(data)

    def on_post_remove(self, req, resp, event_id: str):
        post_body = json.load(req.bounded_stream)
        uqid = post_body.get('uqid', None)
        self._comment_service.delete_comment(uqid=uqid, event_id=event_id)
        resp.status = falcon.HTTP_200
        resp.media = {'success': True}
