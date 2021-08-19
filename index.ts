import { EditorState } from '@codemirror/state';
import {
  EditorView,
  ViewPlugin,
  PluginField,
  WidgetType,
  Decoration,
  ViewUpdate,
  Range
} from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { javascriptLanguage } from '@codemirror/lang-javascript';
import {
  defaultHighlightStyle,
  classHighlightStyle
} from '@codemirror/highlight';


const imageRE = /!\[([^\[\]]*)\]\(([^\)\(\s]+)(?:\s"([^\"]+)")?(?:\s=(\d+x\d*))?\)/g;

export function image() {
  return [imageDecorationPlugin];
}

const imageDecorationPlugin = ViewPlugin.fromClass(
  class {
    decorations = Decoration.none;

    constructor(public view: EditorView) {
      this.view = view;
      this.recompute();
    }

    recompute(update?: ViewUpdate) {
      let decorations: Range<Decoration>[] = [];
      for (let { from, to } of this.view.visibleRanges) {
        this.getDecorationsFor(from, to, decorations);
      }

      this.decorations = Decoration.set(decorations, true);
    }

    update(update:ViewUpdate) {
      if (update.docChanged || update.selectionSet || update.viewportChanged) {
        this.recompute(update);
      }
    }

    getDecorationsFor(from: number, to: number, decorations: Range<Decoration>[]) {
      let { doc } = this.view.state;

      for (
        let pos = from, cursor = doc.iterRange(from, to), m;
        !cursor.next().done;

      ) {
        if (!cursor.lineBreak) {
          while ((m = imageRE.exec(cursor.value))) {
            const linkDecoration = Decoration.replace({
              widget: new ImageWidget({
                altText: m[1],
                url: m[2],
                title: m[3],
                size: m[4]
              }),
              inclusive: true
            });
            decorations.push(
              linkDecoration.range(pos + m.index, pos + m.index + m[0].length)
            );
          }
        }
        pos += cursor.value.length;
      }
    }
  },
  {
    decorations: v => v.decorations,
    provide: PluginField.atomicRanges.from(v => v.decorations)
  }
);

class ImageWidget extends WidgetType {
  constructor(public spec: any) {
    super();
    this.spec = spec;
  }

  eq(other: ImageWidget) {
    return (
      this.spec.altText === other.spec.altText &&
      this.spec.title === other.spec.title &&
      this.spec.ref === other.spec.ref &&
      this.spec.size === other.spec.size
    );
  }

  toDOM() {
    let image = document.createElement('img');
    image.className = 'cm-image';
    image.style.cursor = 'pointer';
    if (this.spec.url) {
      image.src = this.spec.url;
    }
    return image;
  }

  ignoreEvent() {
    return false;
  }
}

// Bring up the editor.
let debugState = EditorState.create({
  doc: ``,
  extensions: [
    EditorView.lineWrapping,
    defaultHighlightStyle,
    classHighlightStyle,
    image(),
    markdown({
      defaultCodeLanguage: javascriptLanguage,
      addKeymap: false
    })
  ]
});

let view = new EditorView({
  state: debugState,
  parent: document.getElementById('root')!
});
