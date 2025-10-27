import { Show } from "solid-js";
import { Portal } from "solid-js/web";

export default function Modal(props) {
  return (
    <Show when={props.open}>
      <Portal mount={document.querySelector("#root")}>
        <div
          class="modal"
          style={{
            "--modal-width": props.width || "800px",
            "--modal-height": props.height || "400px",
          }}
        >
          <div class="overlay" />
          <div class="modal-content">
            <div class="modal-header">{props.header}</div>
            <div class="modal-body">{props.children}</div>
            <div class="modal-actions">{props.actions}</div>
          </div>
        </div>
      </Portal>
    </Show>
  );
}
