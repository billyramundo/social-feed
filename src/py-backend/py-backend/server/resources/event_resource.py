import dataclasses as dc
import json
from logging import getLogger

import falcon

from py_interview.common.service.event_service import EventService


class EventResource:

    def __init__(self, event_service: EventService):
        self._event_service = event_service
        self._logger = getLogger(self.__module__)

    def on_get(self, req, resp):
        events = self._event_service.get_events()

        resp.status = falcon.HTTP_200  # This is the default status
        resp.media = [dc.asdict(event) for event in events]

    def on_post(self, req, resp):
        """Handles GET requests"""
        post_body = json.load(req.bounded_stream)
        uqid = post_body.get('uqid', None)
        name = post_body.get('name', None)
        description = post_body.get('description', None)
        img_link = post_body.get('img_link', None)
        data = self._event_service.create_or_update_event(
            uqid=uqid, name=name, description=description, img_link=img_link)

        resp.status = falcon.HTTP_200  # This is the default status
        resp.media = dc.asdict(data)

    def on_post_like(self, req, resp):
        """Handles GET requests"""
        post_body = json.load(req.bounded_stream)
        uqid = post_body.get('uqid', None)

        self._event_service.like_event(uqid=uqid)
        resp.media = {'success': True}

        resp.status = falcon.HTTP_200  # This is the default status
