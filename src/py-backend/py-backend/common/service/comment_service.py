import abc
from typing import List
from py_interview.common.data_layer.comment_data_layer import CommentDataLayer
from py_interview.common.domain.comment import CommentDTO, comment_to_dto, new_comment


class CommentService(metaclass=abc.ABCMeta):
    def get_comments(self, event_id: str, offset:int, limit: int) -> List[CommentDTO]:
        """
        Gets comments for an event
        
        :param event_id:
        :return: List[CommentDTO]
        """

    def create_or_update_comment(self, uqid: str, event_id: str, content: str) -> CommentDTO:
        """
        Creates or updates a comment
        
        :param uqid:
        :param event_id:
        :param content:
        :return: CommentDTO
        """

    def delete_comment(self, uqid: str) -> None:
        """
        Deletes a comment
        
        :param uqid:
        :return: None
        """

class CommentServiceDefault(CommentService):
    def __init__(self, comment_data_layer: CommentDataLayer):
        self._comment_data_layer = comment_data_layer

    def get_comments(self, event_id: str, offset: int,  limit: int) -> List[CommentDTO]:
        return [comment_to_dto(comment) for comment in self._comment_data_layer.list(event_id=event_id, offset=offset, limit=limit)]


    def create_or_update_comment(self, uqid: str, event_id: str, content: str) -> CommentDTO:
        if uqid:
            comment = self._comment_data_layer.get(uqid=uqid)
            assert comment
            comment = self._comment_data_layer.update(uqid=uqid, attr={'content': content})
            
        else:
            comment = self._comment_data_layer.create(new_comment(event_id=event_id, content=content, user="user"))
            
        return comment_to_dto(comment)

    def delete_comment(self, uqid: str) -> None:
        self._comment_data_layer.delete(uqid)
        
