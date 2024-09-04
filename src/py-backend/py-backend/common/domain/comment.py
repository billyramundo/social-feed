from dataclasses import dataclass, asdict
from py_interview.common.helpers.base.base import Base, create_base

@dataclass(frozen=True, kw_only=True, slots=True)
class Comment(Base):
    event_id: str
    content: str
    
    def __as_dict__(self, path: dict, **kwargs):
        for key in path.keys():
            if key in self.__slots__:
                yield key, getattr(self, key)
            elif key in Base.__slots__:
                yield key, getattr(Base, key)
            elif hasattr(self, key):
                atr = getattr(self, key)
                yield key, atr(**kwargs)

def new_comment(event_id: str, content: str, user: str) -> Comment:
    return Comment(event_id=event_id, content=content, **asdict(create_base(user=user)))

@dataclass(slots=True)
class CommentDTO:
    uqid: str
    event_id: str
    content: str

def comment_to_dto(comment: Comment) -> CommentDTO:
    return CommentDTO(uqid=comment.uqid, event_id=comment.event_id, content=comment.content)
