import { CKEditor } from "@ckeditor/ckeditor5-react";
import {
  Alignment,
  BlockQuote,
  Bold,
  ClassicEditor,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontSize,
  Heading,
  HorizontalLine,
  Italic,
  Link,
  List,
  Paragraph,
  RemoveFormat,
  SourceEditing,
  Strikethrough,
  Table,
  TableToolbar,
  Underline,
  Undo,
} from "ckeditor5";
import "ckeditor5/ckeditor5.css";

interface RichTextEditorProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/** CKEditor 5 rich-text editor (GPL). Emits HTML strings. */
export function RichTextEditor({
  id,
  value,
  onChange,
  placeholder,
}: RichTextEditorProps) {
  return (
    <div id={id} className="rich-text-editor">
      <CKEditor
        editor={ClassicEditor}
        config={{
          licenseKey: "GPL",
          placeholder: placeholder ?? "Write content here...",
          plugins: [
            Essentials,
            Paragraph,
            Heading,
            Bold,
            Italic,
            Underline,
            Strikethrough,
            FontSize,
            FontColor,
            FontBackgroundColor,
            Alignment,
            List,
            Link,
            BlockQuote,
            Table,
            TableToolbar,
            HorizontalLine,
            RemoveFormat,
            SourceEditing,
            Undo,
          ],
          toolbar: [
            "undo",
            "redo",
            "|",
            "heading",
            "|",
            "bold",
            "italic",
            "underline",
            "strikethrough",
            "|",
            "fontSize",
            "fontColor",
            "fontBackgroundColor",
            "|",
            "alignment",
            "|",
            "bulletedList",
            "numberedList",
            "|",
            "link",
            "blockQuote",
            "insertTable",
            "horizontalLine",
            "|",
            "sourceEditing",
            "removeFormat",
          ],
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
        }}
        data={value}
        onChange={(_event, editor) => {
          onChange(editor.getData());
        }}
      />
    </div>
  );
}
