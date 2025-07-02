import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import {
  ClassicEditor,
  Alignment,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  Base64UploadAdapter,
  BlockQuote,
  Bold,
  CodeBlock,
  Emoji,
  Essentials,
  FontBackgroundColor,
  FontColor,
  FontFamily,
  FontSize,
  GeneralHtmlSupport,
  Heading,
  Highlight,
  HorizontalLine,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsert,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  ImageUpload,
  Indent,
  IndentBlock,
  Italic,
  Link,
  LinkImage,
  List,
  ListProperties,
  MediaEmbed,
  Mention,
  Paragraph,
  PasteFromOffice,
  RemoveFormat,
  ShowBlocks,
  SourceEditing,
  Style,
  Subscript,
  Table,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextPartLanguage,
  TextTransformation,
  Title,
  TodoList,
  Underline,
  WordCount
} from 'ckeditor5';

import 'ckeditor5/ckeditor5.css';
import './styles.css';

const LICENSE_KEY = 	'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NTI1Mzc1OTksImp0aSI6ImYwMWM0NmE1LTE0OTMtNDNhZS05ZTBjLWMyNjFlYjI1ZjQzNyIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiLCJzaCJdLCJ3aGl0ZUxhYmVsIjp0cnVlLCJsaWNlbnNlVHlwZSI6InRyaWFsIiwiZmVhdHVyZXMiOlsiKiJdLCJ2YyI6ImEwMWJkODk4In0.5noAzhOjhEEeWM4aw_tZ67rfUup7JkxI0X9EAxK8h9GndEVO0kcG8e-qhdBROx7DxAwJPyNuob_ZamctpCRGkw';
; // rút gọn để ngắn gọn

interface CKEditorComponentProps {
  onChange?: (event: any, editor: any) => void;
  initialData?: string;
}

export default function CKEditorComponent({ onChange, initialData }: CKEditorComponentProps) {
  const editorWordCountRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const editorConfig = useMemo(() => {
    return {
      toolbar: {
        items: [
          'undo', 'redo', '|',
          'sourceEditing', 'showBlocks', 'textPartLanguage', '|',
          'heading', 'style', '|',
          'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor', '|',
          'bold', 'italic', 'underline', 'subscript', 'removeFormat', '|',
          'emoji', 'horizontalLine', 'link', 'insertImage', 'mediaEmbed',
          'insertTable', 'highlight', 'blockQuote', 'codeBlock', '|',
          'alignment', '|',
          'bulletedList', 'numberedList', 'todoList', 'outdent', 'indent'
        ],
        shouldNotGroupWhenFull: false
      },
      plugins: [
        Alignment, Autoformat, AutoImage, AutoLink, Autosave, Base64UploadAdapter,
        BlockQuote, Bold, CodeBlock, Emoji, Essentials, FontBackgroundColor,
        FontColor, FontFamily, FontSize, GeneralHtmlSupport, Heading, Highlight,
        HorizontalLine, ImageBlock, ImageCaption, ImageInline, ImageInsert,
        ImageInsertViaUrl, ImageResize, ImageStyle, ImageTextAlternative,
        ImageToolbar, ImageUpload, Indent, IndentBlock, Italic, Link, LinkImage,
        List, ListProperties, MediaEmbed, Mention, Paragraph, PasteFromOffice,
        RemoveFormat, ShowBlocks, SourceEditing, Style, Subscript, Table,
        TableCaption, TableCellProperties, TableColumnResize, TableProperties,
        TableToolbar, TextPartLanguage, TextTransformation, Title, TodoList,
        Underline, WordCount
      ],
      image: {
        toolbar: [
          'toggleImageCaption', 'imageTextAlternative', '|',
          'imageStyle:inline', 'imageStyle:wrapText', 'imageStyle:breakText', '|',
          'resizeImage', 'imageStyle:side'
        ]
      },
      initialData: initialData || '<h2>Welcome to CKEditor 5</h2><p>Start editing here...</p>',
      licenseKey: LICENSE_KEY
    };
  }, [isLayoutReady, initialData]);

  return (
    <div className="editor-container">
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        onChange={onChange}
        onReady={editor => {
          const wordCount = editor.plugins.get('WordCount');
          if (editorWordCountRef.current) {
            editorWordCountRef.current.appendChild((wordCount as any).wordCountContainer);
          }
        }}
        onAfterDestroy={() => {
          if (editorWordCountRef.current) {
            editorWordCountRef.current.innerHTML = '';
          }
        }}
      />
      <div ref={editorWordCountRef} className="word-count-container" />
    </div>
  );
}
