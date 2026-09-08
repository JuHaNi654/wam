import { createSignal, Match, Show, Switch } from "solid-js"
import { TSavedApplication } from "../models/models"
import { Portal } from "solid-js/web"
import { Modal, ModalFooter } from "./modal"
import { Button } from "./elements/button"

type Props = {
  application: TSavedApplication
  onUpdate: (data: { [key: string]: string }) => void
}

export default function Documents(props: Props) {
  const [showAd, setShowAd] = createSignal(false)
  const [showApplication, setShowApplication] = createSignal(false)

  return (
    <section class="ring-1 ring-white/20 bg-zinc-800 rounded-lg p-4">
      <header class="mb-3">
        <h3 class="text-md font-display font-semibold uppercase tracking-wide">Documents</h3>
      </header>
      <div class="flex gap-3">
        <button onClick={() => setShowAd(true)} class="btn btn-soft">Job ad</button>
        <Show when={showAd()}>
          <Portal>
            <Modal subTitle="View" title="Job ad" onClose={() => setShowAd(false)}>
              <Document name="ad" content={props.application.ad} />
            </Modal>
          </Portal>
        </Show>
        <button onClick={() => setShowApplication(true)} class="btn btn-soft">Job application</button>
        <Show when={showApplication()}>
          <Portal>
            <Modal subTitle="View" title="Job application" onClose={() => setShowApplication(false)}
              footer={(
                <ModalFooter>
                  <Button onClick={() => setShowApplication(false)} variant="outline" label="Cancel" />
                  <Button onClick={() => { }} variant="primary" label="Save entry" />
                </ModalFooter>
              )}>
              <Document name="application" content={props.application.application}
                editable={true} onUpdate={props.onUpdate} />
            </Modal>
          </Portal>
        </Show>
      </div>
    </section>
  )
}

type DocumentProps = {
  name: string;
  editable?: boolean;
  content?: string;
  onUpdate?: (content: { [key: string]: string }) => void
}

function Document(props: DocumentProps) {
  return (
    <div class="spac-y-3 h-full flex flex-col">
      <Switch>
        <Match when={props.editable}>
          <div class="prose prose-sm max-w-none whitespace-pre-wrap text-sm leading-relaxed flex-1">
            <textarea class="textarea w-full" rows={10} value={props.content || "No content yet"}
              onChange={(e) => props.onUpdate && props.onUpdate({ [props.name]: e.target.value })} />
          </div>
        </Match>
        <Match when={!props.editable}>
          <div class="max-w-none text-sm flex-1">
            {props.content || "No content yet"}
          </div>
        </Match>
      </Switch>

    </div>
  )
}
