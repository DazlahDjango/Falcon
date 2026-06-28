// src/hooks/reviews/useComments.js
import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useMemo } from 'react';
import {
  selectAllComments,
  selectCommentsLoading,
  selectCommentsError,
  selectSelectedComment,
  selectCommentReplies,
  selectCommentsForObject,
  selectResolvedComments,
  selectUnresolvedComments,
} from '../../store/reviews/selectors';
import {
  fetchComments,
  fetchComment,
  createComment,
  updateComment,
  patchComment,
  deleteComment,
  resolveComment,
  unresolveComment,
  editComment,
  fetchCommentsForObject,
  fetchCommentReplies,
  resetCommentState,
} from '../../store/reviews/slices/comment.slice';
import { useReviewsPermissions } from './';

const useComments = () => {
  const dispatch = useDispatch();
  const permissions = useReviewsPermissions();

  // Selectors
  const data = useSelector(selectAllComments);
  const loading = useSelector(selectCommentsLoading);
  const error = useSelector(selectCommentsError);
  const selected = useSelector(selectSelectedComment);
  const replies = useSelector(selectCommentReplies);
  const resolvedComments = useSelector(selectResolvedComments);
  const unresolvedComments = useSelector(selectUnresolvedComments);

  // Actions
  const fetchAll = useCallback(
    (params) => dispatch(fetchComments(params)),
    [dispatch]
  );

  const fetchOne = useCallback(
    (id) => dispatch(fetchComment(id)),
    [dispatch]
  );

  const create = useCallback(
    (data) => {
      if (!permissions.canCreateComment) {
        throw new Error('You do not have permission to create comments');
      }
      return dispatch(createComment(data));
    },
    [dispatch, permissions.canCreateComment]
  );

  const update = useCallback(
    (id, data) => {
      if (!permissions.canUpdateComment) {
        throw new Error('You do not have permission to update comments');
      }
      return dispatch(updateComment({ id, data }));
    },
    [dispatch, permissions.canUpdateComment]
  );

  const patch = useCallback(
    (id, data) => {
      if (!permissions.canUpdateComment) {
        throw new Error('You do not have permission to update comments');
      }
      return dispatch(patchComment({ id, data }));
    },
    [dispatch, permissions.canUpdateComment]
  );

  const remove = useCallback(
    (id) => {
      if (!permissions.canDeleteComment) {
        throw new Error('You do not have permission to delete comments');
      }
      return dispatch(deleteComment(id));
    },
    [dispatch, permissions.canDeleteComment]
  );

  const resolve = useCallback(
    (id) => {
      if (!permissions.canUpdateComment) {
        throw new Error('You do not have permission to resolve comments');
      }
      return dispatch(resolveComment(id));
    },
    [dispatch, permissions.canUpdateComment]
  );

  const unresolve = useCallback(
    (id) => {
      if (!permissions.canUpdateComment) {
        throw new Error('You do not have permission to unresolve comments');
      }
      return dispatch(unresolveComment(id));
    },
    [dispatch, permissions.canUpdateComment]
  );

  const edit = useCallback(
    (id, comment) => {
      if (!permissions.canUpdateComment) {
        throw new Error('You do not have permission to edit comments');
      }
      return dispatch(editComment({ id, comment }));
    },
    [dispatch, permissions.canUpdateComment]
  );

  const getForObject = useCallback(
    (contentType, objectId) => dispatch(fetchCommentsForObject({ contentType, objectId })),
    [dispatch]
  );

  const getReplies = useCallback(
    (parentId) => dispatch(fetchCommentReplies(parentId)),
    [dispatch]
  );

  const getCommentsForObject = useCallback(
    (state, contentType, objectId) => selectCommentsForObject(state, contentType, objectId),
    []
  );

  const reset = useCallback(
    () => dispatch(resetCommentState()),
    [dispatch]
  );

  // Computed
  const canManage = useMemo(
    () => permissions.canCreateComment,
    [permissions.canCreateComment]
  );

  return {
    // Data
    data,
    loading,
    error,
    selected,
    replies,
    resolvedComments,
    unresolvedComments,

    // CRUD Operations
    fetchAll,
    fetchOne,
    create,
    update,
    patch,
    remove,

    // Actions
    resolve,
    unresolve,
    edit,
    getForObject,
    getReplies,
    getCommentsForObject,
    reset,

    // Permissions
    canManage,

    // Utilities
    isEmpty: data.length === 0,
    totalCount: data.length,
    getById: (id) => data.find((item) => item.id === id),
    getResolvedCount: resolvedComments.length,
    getUnresolvedCount: unresolvedComments.length,
  };
};

export default useComments;