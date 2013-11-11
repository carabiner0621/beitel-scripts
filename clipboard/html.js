////////////////////////////////////////////////////////////////////
// HTML+Clipboardスクリプト
////////////////////////////////////////////////////////////////////
importPackage(java.lang);
importPackage(java.util);
importPackage(java.io);
importPackage(java.awt);
importPackage(java.awt.datatransfer);

// HTML化します。
var htmlContent = htmlOf(window.selectedNodes[0], 0, 0, true);
var html = "<html><body>" + htmlContent + "</body></html>";

// 得られた文字列をクリップボードへ貼りつけます。
var clipboard = new Clipboard("text/html");
clipboard.copy(html);

System.out.println("コピーしました。");


// HTML化します。
function htmlOf(node, headerLevel, currentIndex) {
	var r = "";
	var childHeaderLevel = headerLevel;
	var tagset = null;

	// 見出し
	if(isHeader(node)) {
		childHeaderLevel = headerLevel + 1;
		var tagIndex = headerLevel + 1;
		var tag = "h" + tagIndex;
		tagset = {startTag: "<" + tag + ">", endTag: "</" + tag + ">",
				startChildTag: "", endChildTag: "", startChildListTag: "", endChildListTag: "", keepContentPTag: false}
	}else{
		childHeaderLevel = 0;
	}

	// (1), 1.など
	itemizeTagset = getItemizeTagset(node);
	if(itemizeTagset != null) {
		tagset = itemizeTagset;
	}

	// ソースコード
	// 背景色が#dcdcdcのものはソースコードとみなす
	if(isSourceCode(node)) {
		tagset = {startTag: "<pre class=\"prettyprint\">", endTag: "</pre>",
				startChildTag: "", endChildTag: "", startChildListTag: "", endChildListTag: "", keepContentPTag: false}
	}

	// 本体の出力
	var keepContentPTag = true;
	if(tagset != null) {
		r += tagset.startTag;
		keepContentPTag = tagset.keepContentPTag;
	}
	r += htmlContentOf(node, keepContentPTag);
	if(tagset != null) {
		r += tagset.endTag;
		r += tagset.startChildListTag;
	}
	var childNodes = node.childNodes;
	var index = 0;
	for(var i = 0; i < childNodes.length; i ++) {
		var childNode = childNodes[i];
		if(tagset != null) {
			r += tagset.startChildTag;
		}
		r += htmlOf(childNode, childHeaderLevel, index);
		if(tagset != null) {
			r += tagset.endChildTag;
		}
		if(childNode.nodeType == "topic") {
			index ++;			
		}
	}
	if(tagset != null) {
		r += tagset.endChildListTag;
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

// 箇条書きのタグセットの取得
function getItemizeTagset(node) {
	var childTopicType = null;
	var childNodes = node.childNodes;
	for(var i = 0; i < childNodes.length; i ++) {
		var childNode = childNodes[i];
		if(childNode.nodeType == "topic") {
			childTopicType = childNode.topicType;
		}
	}

	if(childTopicType == null) {
		return null;
	}else if(childTopicType == 11) {
		// (n)
		return {startTag: "", endTag: "", startChildTag: "<li>", endChildTag: "</li>", startChildListTag: "<ol>", endChildListTag: "</ol>", keepContentPTag: true}
	}
	return null;
}

// ソースコードかどうかを判別
function isSourceCode(node) {
	var bg = node.background;
	if(bg == null) {
		return false;
	}
	// #dcdcdcをソースコードとみなす
	if(bg.red == bg.blue && bg.blue == bg.green && bg.red == 0xdc) {
		return true;
	}
	return false;
}

// ノード自身のHTMLコンテンツの取得
function htmlContentOf(node, keepContentPTag) {
	if(keepContentPTag) {
		return convertMacro(node.html);
	}
	var html = new String(node.html);
	var startTagPattern = /<p[^>]*>/g;
	html = html.replace(startTagPattern, "");
	
	var endTagPattern = /<\/p>/g;
	html = html.replace(endTagPattern, "\n");
	
	return convertMacro(html);
}

function convertMacro(html) {
	var specialChPattern = /\&[^;]+FEFF;/g;
	html = html.replace(specialChPattern, "");

	// リンク対応
	var linkPattern = /\[([^\]]+)\]\s*\(([^\)]+)\)/g;
	html = html.replace(linkPattern, "<a href=\"$2\">$1</a>");
	return html;
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
						return value;
					} else if (className == "java.io.StringReader") {
						return new StringReader(value);
					} else if (className == "java.io.InputStream") {
						return new StringBufferInputStream(value);
					}
					throw new UnsupportedFlavorException(flavor);
				}
			});
			Toolkit.getDefaultToolkit().getSystemClipboard().setContents(trans, null);
		};
	
}
