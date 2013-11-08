////////////////////////////////////////////////////////////////////
// Plain Text+Clipboardスクリプト
////////////////////////////////////////////////////////////////////
importPackage(java.lang);
importPackage(java.util);
importPackage(java.io);
importPackage(java.awt);
importPackage(java.awt.datatransfer);

// Plain Text化します。
// 見出し記号をArrayで指定し、Plain Text化したいノードを指定します。
var headerSymbol = ["■", "▼", "-"];
var text = textOf("", window.selectedNodes[0], 0, 0);

var clipboard = new Clipboard("text/plain");
clipboard.copy(text);


// Plain Text化します。
function textOf(indent, node, headerLevel, currentIndex) {
	var r = "";
	var childIndent = "  ";
	var childHeaderLevel = headerLevel;

	// 見出し
	if(isHeader(node)) {
		childHeaderLevel = headerLevel + 1;
		if(headerLevel < headerSymbol.length) {
			r += headerSymbol[headerLevel];		
		}
		childIndent = "";
	}else{
		childHeaderLevel = 0;
	}

	// (1), 1.など
	itemizeRenderer = getItemizeRenderer(node);
	if(itemizeRenderer != null) {
		r += indent + itemizeRenderer(currentIndex);
	}

	// 本体の出力
	if(r.length == 0) {
		r += indent;
	}
	r += node.text + "\n";
	var childNodes = node.childNodes;
	var index = 0;
	for(var i = 0; i < childNodes.length; i ++) {
		var childNode = childNodes[i];
		r += textOf(indent + childIndent, childNode, childHeaderLevel, index);
		if(childNode.nodeType == "topic") {
			index ++;			
		}
	}
	return r;
}

// 見出しかどうかを判別(n.n.n.の形式のみ見出しと判別)
function isHeader(node) {
	// topicTypeの定数
	// http://beitel.carabiner.jp/javadoc/jp/carabiner/treeeditor/TreeEditorConst.html#NUMBER_SECTION
	if(node.topicType == 1 && node.nodeType == "topic") {
		return true;
	}
	return false;
}

// 箇条書きのレンダリングロジックの取得
function getItemizeRenderer(node) {
	if(node.topicType == 11 && node.nodeType == "topic") {
		// (n)
		return function(index) {
					// 1ベースのインデックスに変更
					var displayIndex = index + 1;
					return "(" + displayIndex + ")";
				};
	}
	return null;
}

// Clipboardの処理を実装します。
function Clipboard(mimeType) {

	this.copy = function(value) {
			var flavors = new ArrayList();
			flavors.add(new DataFlavor(mimeType + ";class=java.lang.String"));
			flavors.add(new DataFlavor(mimeType + ";class=java.io.Reader"));
			flavors.add(new DataFlavor(mimeType + ";charset=unicode;class=java.io.InputStream"));
			
			var trans = new Transferable({
				getTransferDataFlavors: function() {
					return flavors.toArray(java.lang.reflect.Array.newInstance(java.awt.datatransfer.DataFlavor, 0));
				},
				isDataFlavorSupported: function(flavor) {
					return flavors.contains(flavor);
				},
				getTransferData: function(flavor) {
					var className = flavor.getRepresentationClass().name;
					if (className == "java.lang.String") {
						return text;
					} else if (className == "java.io.StringReader") {
						return new StringReader(text);
					} else if (className == "java.io.InputStream") {
						return new StringBufferInputStream(text);
					}
					throw new UnsupportedFlavorException(flavor);
				}
			});
			Toolkit.getDefaultToolkit().getSystemClipboard().setContents(trans, null);
		};
	
}
