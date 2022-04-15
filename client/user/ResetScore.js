import React, {useState} from 'react'
import PropTypes from 'prop-types'
import IconButton from '@material-ui/core/IconButton'
import Button from '@material-ui/core/Button'
import DeleteIcon from '@material-ui/icons/Delete'
import Dialog from '@material-ui/core/Dialog'
import DialogActions from '@material-ui/core/DialogActions'
import DialogContent from '@material-ui/core/DialogContent'
import DialogContentText from '@material-ui/core/DialogContentText'
import DialogTitle from '@material-ui/core/DialogTitle'
import auth from './../auth/auth-helper'
import {resetscore} from "./api-user";

export default function ResetScore(props) {
    const [open, setOpen] = useState(false)

    const jwt = auth.isAuthenticated()

    const clickButton = () => {
        console.log(props)
        setOpen(true)
    }

    const resetScore = () => {
        resetscore({
            userId: props.userId
        }, {t: jwt.token}).then((data) => {
            if (data && data.error) {
                console.log(data.error)
            } else {
                setOpen(false)
            }
        })
    }

    const handleRequestClose = () => {
        setOpen(false)
    }

    return (<span>
      <IconButton aria-label="Delete" onClick={clickButton} color="secondary">
        <DeleteIcon/>
      </IconButton>

      <Dialog open={open} onClose={handleRequestClose}>
        <DialogTitle>{"Reset high score"}</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Confirm to clear your previous high score.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRequestClose} color="primary">
            Cancel
          </Button>
          <Button onClick={resetScore} color="secondary" autoFocus="autoFocus">
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </span>)

}
ResetScore.propTypes = {
    userId: PropTypes.string.isRequired
}

