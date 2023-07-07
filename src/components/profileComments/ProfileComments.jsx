import { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux/es/exports'
import { faTrashCan, faCaretDown } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import './ProfileComments.css'
import NoPost from '../NoPost'
import { confirmClose } from '../../reducers/className/classSlice'
import { openConfirm, openPreStorie } from '../../reducers/opnModalSlice/openModal'
import ConfirmModal from '../confirmModal/ConfirmModal'
import Loading from '../loading/Loading'
import { formatDate } from '../../utils/functions'
import PreStorie from '../PreStorie'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '../button/Button'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { deleteCommets } from '../../services/comments'

const ProfileComments = ({ data }) => {
  // Función que actualiza el estado global
  const dispatch = useDispatch()
  const queryClient = useQueryClient()

  // estados globales
  const { id, token, username } = useSelector(state => state.user)
  const { menu, confirm, preStorie } = useSelector(state => state.openModal)

  // estados locales
  const [commentId, setCommentId] = useState({})
  const [storieId, setStorieId] = useState(null)
  const [loading, setLoading] = useState(false)
  const [deleteId, setDeleteId] = useState(null)

  // Funcion para eliminar un comentario especifico con useMutation
  const eliminarComentario = async () => {
    setLoading(true)
    dispatch(openConfirm({ confirm: false }))
    return await deleteCommets(deleteId, { token })
  }

  const { mutate } = useMutation({
    mutationFn: eliminarComentario,
    onSuccess: () => {
      queryClient.invalidateQueries(username)
      setLoading(false)
    }
  })

  // funcion para abrir menu para eliminar un comentario
  const open = (id) => {
    dispatch(confirmClose({ confirmClass: '' }))
    dispatch(openConfirm({ confirm: true }))
    setDeleteId(id)
  }

  // funcion para cerrar el munu en caso que se presione "cancelar"
  const cancelAction = () => {
    dispatch(confirmClose({ confirmClass: 'confirmClass' }))
    setTimeout(() => {
      dispatch(openConfirm({ confirm: false }))
      dispatch(confirmClose({ confirmClass: '' }))
    }, 200)
  }

  // funcion para abrir un modal donde se podrá responder el comentario y subirlo a la historia
  const openInput = (id) => {
    dispatch(openPreStorie({ preStorie: true }))
    setStorieId(id)
  }

  const variants = {
    hidden: {
      opacity: 0
    },
    visible: () => ({
      opacity: 1,
      transition: {
        duration: 0.5
      }
    })
  }

  return (
    <motion.ul layout className='user-comments-container'>
      {(data.comments.length === 0) &&
        <NoPost id={id} _id={data._id} />}
      <AnimatePresence>
        {data.comments?.map((comment, index) => (
          <motion.li
            key={comment._id}
            style={{ userSelect: 'none' }}
            className={`comment-container-profile ${comment._id === commentId ? 'viewMore' : ''}`}
            variants={variants}
            initial='hidden'
            animate='visible'
            exit='hidden'
            layoutId={comment._id}
          >
            {(loading && (comment._id === deleteId)) && <Loading className='loader-container3' />}
            <div className='container-date-by'>
              <h4 className='by'>by: {comment.by}</h4>
              <div className={`${id !== data._id ? 'date-comment-two' : 'date-comment'}`}>{formatDate(comment.createdAt)}</div>
            </div>
            {comment.comment?.split(' ').length > 30 &&
              <div className={`view-more-icon ${comment._id === commentId ? 'd-none' : ''}`} onClick={() => setCommentId(comment._id)}>
                <FontAwesomeIcon icon={faCaretDown} style={{ fontSize: '20px' }} />
              </div>}
            <p>{comment.comment}</p>
            {id === data._id &&
              <FontAwesomeIcon
                className='options-icon'
                onClick={() => open(comment._id)}
                icon={faTrashCan}
              >eliminar
              </FontAwesomeIcon>}
            {
          (confirm && !menu) &&
            <ConfirmModal
              cancelAction={cancelAction}
              cancel='cancelar'
              colorCancel='#2ad'
              accept='Eliminar'
              colorAccept='#f55'
              acceptAction={mutate}
              text='¿Eliminar post?'
            />
          }
            {id === data._id && <Button onClick={() => openInput(comment._id)} title='responder' color='#2ad' />}
            {preStorie && (storieId === comment._id) &&
              <PreStorie commentId={comment._id} comment={comment} />}
          </motion.li>
        )).reverse()}
      </AnimatePresence>
    </motion.ul>
  )
}

export default ProfileComments
