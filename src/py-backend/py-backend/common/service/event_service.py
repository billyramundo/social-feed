import abc
from typing import List

from py_interview.common.data_layer.event_data_layer import EventDataLayer
from py_interview.common.domain.event import EventDTO, event_to_dto, new_event


class EventService(metaclass=abc.ABCMeta):
    def get_events(self) -> List[EventDTO]:
        """
        gets all events

        :param user:
        :return: List[EventDTO]
        """

    def create_or_update_event(self, uqid: str, name: str, description: str,
                               img_link: str) -> EventDTO:
        """
        creates or updates events

        :param description:
        :param img_link:
        :param name:
        :param uqid:
        :return: EventDTO
        """

    def like_event(self, uqid: str) -> None:
        """
        likes an event

        :param uqid:
        :return: None
        """


class EventServiceDefault(EventService):

    def __init__(self, event_data_layer: EventDataLayer):
        self._event_data_layer = event_data_layer

    def get_events(self) -> List[EventDTO]:
        return [event_to_dto(event) for event in self._event_data_layer.list()]
   

    def create_or_update_event(self, uqid: str, name: str, description: str,
                               img_link: str) -> EventDTO:
        if uqid is not None:
            event = self._event_data_layer.get(uqid=uqid)
            assert event

            event = self._event_data_layer.update(
                uqid=uqid, attr={'name': name, 'description': description,
                                 'img_link': img_link}
            )
        else:
            event = self._event_data_layer.create(
                new_event(name=name, description=description, img_link=img_link, number_of_likes=0)
            )
        return event_to_dto(event)

    # why do we have this, could you collapse this to the create_or_update_event function?
    def like_event(self, uqid: str) -> None:
        event = self._event_data_layer.get(uqid=uqid)
        assert event

        self._event_data_layer.update(
            uqid=uqid, attr={'number_of_likes': event.number_of_likes + 1}
        )
