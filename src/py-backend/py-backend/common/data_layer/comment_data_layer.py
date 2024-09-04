import abc
from typing import Union, List, Optional, Dict, Any
from py_interview.common.domain.comment import Comment
from py_interview.common.helpers.base.base_data_layer import BaseDataLayer
from py_interview.common.helpers.base.base_data_layer_in_memory import BaseDataLayerInMemory

class CommentDataLayer(BaseDataLayer, metaclass=abc.ABCMeta):
    @abc.abstractmethod
    def create(self, obj: Union[Comment, List[Comment]]) -> Union[Comment, List[Comment]]:
        """
        Creates a comment
        """

    @abc.abstractmethod
    def get(self, uqid: str = None, **kwargs) -> Optional[Comment]:
        """
        Gets a specific comment by its unique ID
        """

    @abc.abstractmethod
    def list(self, uqid: str | List[str] = None, offset: int = 0, limit: int = None, **kwargs) -> List[Comment]:
        """
        Lists comments for a specific event with pagination
        """

    @abc.abstractmethod
    def update(self, uqid: str, attr: Dict[str, Any], user: str = 'unknown') -> Optional[Comment]:
        """
        Updates a comment
        """

    @abc.abstractmethod
    def delete(self, uqid: str) -> Optional[Comment]:
        """
        Deletes a comment
        """

class CommentDataLayerInMemory(BaseDataLayerInMemory, CommentDataLayer):
    def __init__(self):
        super(CommentDataLayerInMemory, self).__init__(target_class=Comment)
