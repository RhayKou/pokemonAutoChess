import React, { useState, useEffect } from "react"
import Modal from "react-bootstrap/Modal"
import { IBot } from "../../../../../models/mongo-models/bot-v2"
import { ModalMode } from "../../../../../types"
import { useAppDispatch, useAppSelector } from "../../../hooks"
import { requestBotData } from "../../../stores/NetworkStore"
import { t } from "i18next"

const textAreaStyle = {
  height: "400px"
}

const buttonStyle = {
  marginLeft: "10px",
  marginTop: "10px",
  marginRight: "10px"
}

export default function ModalMenu(props: {
  showModal: (mode: ModalMode) => void
  bot: IBot
  hideModal: () => void
  modalMode: ModalMode
  importBot: (text: string) => void
  pasteBinUrl: string
  createBot: () => void
  botData: IBot
  modalBoolean: boolean
}) {
  useEffect(() => {
    if (props.botData?.avatar) {
      handleTextAreaChange(JSON.stringify(props.botData))
    }
  }, [props.botData])
  const dispatch = useAppDispatch()
  const botList: {
    name: string
    avatar: string
    id: string
    author: string
  }[] = useAppSelector((state) => state.lobby.botList)
  const url =
    props.pasteBinUrl.length == 0 ? null : (
      <h5>
        {t("url_created")}:<a href={props.pasteBinUrl}>{props.pasteBinUrl}</a>
      </h5>
    )
  const [textArea, handleTextAreaChange] = useState<string>("")
  if (props.modalMode == ModalMode.EXPORT) {
    return (
      <Modal show={props.modalBoolean} onHide={props.hideModal} size="lg">
        <Modal.Header>
          <Modal.Title>Export</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("export_hint")}</p>
          <textarea
            style={textAreaStyle}
            className="nes-textarea"
            defaultValue={JSON.stringify(props.bot, null, 2)}
          ></textarea>
          <p>{t("bot_ready_submission")}</p>
          {url}
        </Modal.Body>
        <Modal.Footer>
          <button
            style={buttonStyle}
            className="bubbly red"
            onClick={props.hideModal}
          >
            {t("cancel")}
          </button>
          <button
            style={buttonStyle}
            className="bubbly green"
            onClick={() => {
              props.createBot()
            }}
          >
            {t("submit_your_bot")}
          </button>
        </Modal.Footer>
      </Modal>
    )
  } else if (props.modalMode == ModalMode.IMPORT) {
    return (
      <Modal show={props.modalBoolean} onHide={props.hideModal} size="lg">
        <Modal.Header>
          <Modal.Title>{t("import")}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>{t("get_started_bot")}</p>
          <div className="nes-field is-inline" style={{ marginBottom: "10px" }}>
            <label htmlFor="default_select">{t("existing_bot")}</label>
            <div className="my-select">
              <select
                defaultValue=""
                onChange={(e) => {
                  if (e.target.value.length != 0) {
                    dispatch(requestBotData(e.target.value))
                  }
                }}
                id="default_select"
              >
                <option value="" hidden>
                  {t("select")}
                </option>
                {botList.map((bot) => (
                  <option key={bot.id} value={bot.id}>
                    {bot.name} {t("by")} {bot.author}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <textarea
            style={textAreaStyle}
            value={textArea}
            onChange={(e) => {
              handleTextAreaChange(e.target.value)
            }}
            className="nes-textarea"
          ></textarea>
        </Modal.Body>
        <Modal.Footer>
          <button
            style={buttonStyle}
            className="bubbly red"
            onClick={props.hideModal}
          >
            {t("cancel")}
          </button>
          <button
            style={buttonStyle}
            className="bubbly green"
            onClick={() => {
              props.importBot(textArea)
            }}
          >
            {t("import")}
          </button>
        </Modal.Footer>
      </Modal>
    )
  } else {
    return null
  }
}
/*
    constructor(props:{

    }){
        super(props);
        state = {
          textArea: ''
        };
    }

    handleScenariosChange(e){
      if(e.target.value.length !=0){
        props.requestBotData(e.target.value)
      }
    }

    handleTextAreaChange(e){
      setState({
        textArea: e.target.value
      })
    }

    convertBotDataToJSON(){
      return JSON.stringify(props.botData)
    }

    componentDidUpdate(prevProps, prevState){
      if(prevProps.botData.avatar != props.botData.avatar){

        setState({
          textArea: JSON.stringify(props.botData)
        })
      }
    }
*/
