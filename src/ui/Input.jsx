import { createUniqueId } from "solid-js";

function Input(props) {
  const { label, name, type, value, onChange } = props;
  const id = createUniqueId();
  return (
    <>
      {label && <label for={id}>{label}</label>}
      <input
        type={type}
        id={id}
        name={name}
        class="mb-2"
        value={value}
        onChange={onChange}
      />
    </>
  );
}

export default Input;
