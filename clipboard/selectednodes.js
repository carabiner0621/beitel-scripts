// ノード情報の出力例
// BEITEL windowグローバルオブジェクトから選択中のノードの
// 情報を取得し、標準出力に出力します。
// http://beitel.carabiner.jp/api-globalobj.html
importPackage(java.lang)

var nodes = window.selectedNodes;
if(nodes == null) {
	System.out.println("選択されていません");
}else{
	for(var i = 0; i < nodes.length; i ++) {
		var node = nodes[i];
		System.out.println("選択されているノード(" + i + "): " + node.text);
		var childNodes = node.childNodes;
		for(var j = 0; j < childNodes.length; j ++) {
			var childNode = childNodes[j];
			System.out.println("        " + "+ " + childNode.text);
		}
	}
}
