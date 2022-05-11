
const WarningItem = (props) => {

  // TODO: add error/warning icon on the right or left of text
  return (
    <div className="warning">
      <span>{props.text}</span>
    </div>
  );
}

export default WarningItem;
