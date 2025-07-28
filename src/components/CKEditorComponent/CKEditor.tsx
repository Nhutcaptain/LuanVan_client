import { useState, useEffect, useRef, useMemo } from 'react';
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react';
import type { EditorConfig } from '@ckeditor/ckeditor5-core';
import type { ClassicEditor as ClassicEditorType } from '@ckeditor/ckeditor5-editor-classic';

const LICENSE_KEY =
  'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3ODI4NjM5OTksImp0aSI6IjE3MDkyNzNkLTA3YzYtNGEzNi05ZmVhLTAyM2JhN2E1ODkxZCIsImxpY2Vuc2VkSG9zdHMiOlsiMTI3LjAuMC4xIiwibG9jYWxob3N0IiwiMTkyLjE2OC4qLioiLCIxMC4qLiouKiIsIjE3Mi4qLiouKiIsIioudGVzdCIsIioubG9jYWxob3N0IiwiKi5sb2NhbCJdLCJ1c2FnZUVuZHBvaW50IjoiaHR0cHM6Ly9wcm94eS1ldmVudC5ja2VkaXRvci5jb20iLCJkaXN0cmlidXRpb25DaGFubmVsIjpbImNsb3VkIiwiZHJ1cGFsIl0sImxpY2Vuc2VUeXBlIjoiZGV2ZWxvcG1lbnQiLCJmZWF0dXJlcyI6WyJEUlVQIiwiRTJQIiwiRTJXIl0sInZjIjoiMzE0NTUwMjMifQ.SlX8-y9IMciTvo24itOLZDT1ldY74yRbuQvB2z_w46raYt_yiGkSCSVwHzuNeuzM8con3hWRZoYLUn83QblpmA';

interface RichTextEditorProps {
  initialData?: string;
  onChange?: (event: any, data: any) => void;
}

export default function RichTextEditor({ initialData = '', onChange }: RichTextEditorProps) {
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);
  const editorWordCountRef = useRef<HTMLDivElement>(null);
  const [isLayoutReady, setIsLayoutReady] = useState(false);
  const cloud = useCKEditorCloud({ version: '46.0.0' });

  useEffect(() => {
    setIsLayoutReady(true);
    return () => setIsLayoutReady(false);
  }, []);

  const { ClassicEditor, editorConfig } = useMemo(() => {
    if (cloud.status !== 'success' || !isLayoutReady) {
      return { ClassicEditor: undefined, editorConfig: undefined };
    }

    const {
      ClassicEditor,
      Alignment,
      Autoformat,
      AutoImage,
      Autosave,
      Base64UploadAdapter,
      BlockQuote,
      Bold,
      Emoji,
      Essentials,
      FontBackgroundColor,
      FontColor,
      FontFamily,
      FontSize,
      Fullscreen,
      GeneralHtmlSupport,
      Heading,
      Highlight,
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
      Markdown,
      MediaEmbed,
      Mention,
      PageBreak,
      Paragraph,
      PasteFromMarkdownExperimental,
      PasteFromOffice,
      PlainTableOutput,
      SpecialCharacters,
      SpecialCharactersArrows,
      SpecialCharactersCurrency,
      SpecialCharactersEssentials,
      SpecialCharactersLatin,
      SpecialCharactersMathematical,
      SpecialCharactersText,
      Strikethrough,
      Style,
      Subscript,
      Superscript,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableLayout,
      TableProperties,
      TableToolbar,
      TextTransformation,
      Title,
      TodoList,
      Underline,
      WordCount
    } = cloud.CKEditor;

    const config: EditorConfig = {
      toolbar: {
        items: [
          'undo',
          'redo',
          '|',
          'fullscreen',
          '|',
          'heading',
          'style',
          '|',
          'fontSize',
          'fontFamily',
          'fontColor',
          'fontBackgroundColor',
          '|',
          'bold',
          'italic',
          'underline',
          'strikethrough',
          'subscript',
          'superscript',
          '|',
          'emoji',
          'specialCharacters',
          'pageBreak',
          'link',
          'insertImage',
          'mediaEmbed',
          'insertTable',
          'insertTableLayout',
          'highlight',
          'blockQuote',
          '|',
          'alignment',
          '|',
          'bulletedList',
          'numberedList',
          'todoList',
          'outdent',
          'indent'
        ],
        shouldNotGroupWhenFull: false
      },
      plugins: [
        Alignment,
        Autoformat,
        AutoImage,
        Autosave,
        Base64UploadAdapter,
        BlockQuote,
        Bold,
        Emoji,
        Essentials,
        FontBackgroundColor,
        FontColor,
        FontFamily,
        FontSize,
        Fullscreen,
        GeneralHtmlSupport,
        Heading,
        Highlight,
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
        Markdown,
        MediaEmbed,
        Mention,
        PageBreak,
        Paragraph,
        PasteFromMarkdownExperimental,
        PasteFromOffice,
        PlainTableOutput,
        SpecialCharacters,
        SpecialCharactersArrows,
        SpecialCharactersCurrency,
        SpecialCharactersEssentials,
        SpecialCharactersLatin,
        SpecialCharactersMathematical,
        SpecialCharactersText,
        Strikethrough,
        Style,
        Subscript,
        Superscript,
        Table,
        TableCaption,
        TableCellProperties,
        TableColumnResize,
        TableLayout,
        TableProperties,
        TableToolbar,
        TextTransformation,
        Title,
        TodoList,
        Underline,
        WordCount
      ],
      fontFamily: {
        supportAllValues: true
      },
      fontSize: {
        options: [10, 12, 14, 'default', 18, 20, 22],
        supportAllValues: true
      },
      fullscreen: {
        onEnterCallback: (container: HTMLElement) =>
          container.classList.add(
            'editor-container',
            'editor-container_classic-editor',
            'editor-container_include-style',
            'editor-container_include-word-count',
            'editor-container_include-fullscreen',
            'main-container'
          )
      },
      heading: {
        options: [
          {
            model: 'paragraph',
            title: 'Paragraph',
            class: 'ck-heading_paragraph'
          },
          {
            model: 'heading1',
            view: 'h1',
            title: 'Heading 1',
            class: 'ck-heading_heading1'
          },
          {
            model: 'heading2',
            view: 'h2',
            title: 'Heading 2',
            class: 'ck-heading_heading2'
          },
          {
            model: 'heading3',
            view: 'h3',
            title: 'Heading 3',
            class: 'ck-heading_heading3'
          },
          {
            model: 'heading4',
            view: 'h4',
            title: 'Heading 4',
            class: 'ck-heading_heading4'
          },
          {
            model: 'heading5',
            view: 'h5',
            title: 'Heading 5',
            class: 'ck-heading_heading5'
          },
          {
            model: 'heading6',
            view: 'h6',
            title: 'Heading 6',
            class: 'ck-heading_heading6'
          }
        ]
      },
      htmlSupport: {
        allow: [
          {
            name: /^.*$/,
            styles: true,
            attributes: true,
            classes: true
          }
        ]
      },
      image: {
        toolbar: [
          'toggleImageCaption',
          'imageTextAlternative',
          '|',
          'imageStyle:inline',
          'imageStyle:wrapText',
          'imageStyle:breakText',
          '|',
          'resizeImage'
        ]
      },
      initialData: initialData,
      licenseKey: LICENSE_KEY,
      link: {
        addTargetToExternalLinks: true,
        defaultProtocol: 'https://',
        decorators: {
          toggleDownloadable: {
            mode: 'manual',
            label: 'Downloadable',
            attributes: {
              download: 'file'
            }
          }
        }
      },
      list: {
        properties: {
          styles: true,
          startIndex: true,
          reversed: true
        }
      },
      mention: {
        feeds: [
          {
            marker: '@',
            feed: []
          }
        ]
      },
      placeholder: 'Type or paste your content here!',
      style: {
        definitions: [
          {
            name: 'Article category',
            element: 'h3',
            classes: ['category']
          },
          {
            name: 'Title',
            element: 'h2',
            classes: ['document-title']
          },
          {
            name: 'Subtitle',
            element: 'h3',
            classes: ['document-subtitle']
          },
          {
            name: 'Info box',
            element: 'p',
            classes: ['info-box']
          },
          {
            name: 'CTA Link Primary',
            element: 'a',
            classes: ['button', 'button--green']
          },
          {
            name: 'CTA Link Secondary',
            element: 'a',
            classes: ['button', 'button--black']
          },
          {
            name: 'Marker',
            element: 'span',
            classes: ['marker']
          },
          {
            name: 'Spoiler',
            element: 'span',
            classes: ['spoiler']
          }
        ]
      },
      table: {
        contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
      }
    };

    return { ClassicEditor, editorConfig: config };
  }, [cloud, isLayoutReady, initialData]);

  return (
    <div className="main-container">
      <div
        className="editor-container editor-container_classic-editor editor-container_include-style editor-container_include-word-count editor-container_include-fullscreen"
        ref={editorContainerRef}
      >
        <div className="editor-container__editor">
          <div ref={editorRef}>
            {ClassicEditor && editorConfig && (
              <CKEditor
                onReady={(editor: ClassicEditorType) => {
                  const wordCount = editor.plugins.get('WordCount');
                  if (editorWordCountRef.current) {
                    editorWordCountRef.current.appendChild(wordCount.wordCountContainer);
                  }
                }}
                onAfterDestroy={() => {
                  if (editorWordCountRef.current) {
                    Array.from(editorWordCountRef.current.children).forEach(child => child.remove());
                  }
                }}
                editor={ClassicEditor}
                config={editorConfig}
                data={initialData}
                onChange={(event, editor) => {
                  const data = editor.getData();
                  onChange?.(event, editor);
                }}
              />
            )}
          </div>
        </div>
        <div className="editor_container__word-count" ref={editorWordCountRef}></div>
      </div>
    </div>
  );
}