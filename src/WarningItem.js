
const WarningItem = (props) => {

  // TODO: add error/warning icon on the right or left of text
  return (
    <div className="warning">
      <span title={!!props.type ? `This is ${props.type}` : ""}>{props.text}</span>
    </div>
  );
}

export default WarningItem;
