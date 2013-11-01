////////////////////////////////////////////////////////////////////
// Plain Text+Clipboardスクリプト
//   
////////////////////////////////////////////////////////////////////
importPackage(java.lang);
importPackage(java.util);
importPackage(java.awt.datatransfer);
importPackage(java.awt);
importPackage(java.awt.event);
importPackage(java.io);
importPackage(java.util);
importPackage(javax.swing);
importPackage(javax.imageio);

// Plain Text化します。
// 見出し記号をArrayで指定し、Plain Text化したいノードを指定します。
var text = headeredTextOf(["■", "▼", "-"], window.selectedNodes[0]);

var clipboard = new Clipboard();
clipboard.copy(text);

// Plain Text化する関数です。必要に応じて見出し記号をつけます。
function headeredTextOf(headers, node) {
	var r = headers[0] + node.text + "\n";
	var childNodes = node.childNodes;

	var nextHeaders = new Array();
	for(var i = 1; i < headers.length; i ++) {
		nextHeaders.push(headers[i]);
	}
	for(var i = 0; i < childNodes.length; i ++) {
		if(nextHeaders.length == 0) {
			r += textOf("  ", childNodes[i]);
		}else{
			r += headeredTextOf(nextHeaders, childNodes[i]);
		}
	}
	return r;
}

// Plain Text化します。
function textOf(indent, node) {
	var r = indent + " " + node.text + "\n";
	var childNodes = node.childNodes;
	for(var i = 0; i < childNodes.length; i ++) {
		r += textOf(indent + "  ", childNodes[i]);
	}
	return r;
}

// Clipboardの処理を実装します。
function Clipboard() {

	this.copy = function(value) {
			var flavors = new ArrayList();
			var mimeType = "text/plain";
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
