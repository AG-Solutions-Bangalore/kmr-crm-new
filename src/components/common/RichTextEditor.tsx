import { CKEditor } from "ckeditor4-react";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
}

/**
 * CKEditor 4 rich-text editor. Emits HTML strings.
 * NOTE: loads the editor runtime from the CKEditor CDN on first render,
 * so an internet connection is required to display the toolbar.
 */
export function RichTextEditor({ id, value, onChange }: RichTextEditorProps) {
  return (
    <div id={id} className="rich-text-editor">
      <CKEditor
        initData={value}
        editorUrl="https://cdn.ckeditor.com/4.22.1/standard-all/ckeditor.js"
        config={{
          height: 320,
          removePlugins: "elementspath",
          resize_enabled: false,
          // 4.22.1 is the last free CKEditor 4 release. Its built-in
          // "version check" flags it as insecure vs commercial LTS builds
          // (4.23+ need a paid licenseKey and refuse to render without one),
          // so the check is disabled — the editor itself is unaffected.
          versionCheck: false,
        }}
        onChange={({ editor }) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
