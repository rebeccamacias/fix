export const Message = ({ message }) => {
  return (
    <div className="message" key={message.timestamp}>
      <h3 className="userName">{message.userName}</h3>
      {message.contents}
    </div>
  )
}