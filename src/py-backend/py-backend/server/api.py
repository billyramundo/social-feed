from py_interview.common.helpers.base_api import BaseAPI
from py_interview.common.service.event_service import EventService
from py_interview.common.service.comment_service import CommentService

from py_interview.server.resources.event_resource import EventResource
from py_interview.server.resources.comment_resource import CommentResource


class Api(BaseAPI):

    def __init__(self, event_service: EventService, comment_service: CommentService):
        BaseAPI.__init__(self)

        if event_service and comment_service:
            event_resource = EventResource(event_service=event_service)
            comment_resource = CommentResource(comment_service=comment_service)
            self.add_route('/api/event', event_resource)
            self.add_route('/api/event/like', event_resource, suffix='like')
            self.add_route('/api/event/{event_id}/comments', comment_resource)
            self.add_route('/api/event/{event_id}/comments/remove', comment_resource, suffix='remove')
        