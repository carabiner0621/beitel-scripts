// 標準出力への出力例
// java.lang.Systemクラスを利用
// http://docs.oracle.com/javase/jp/6/api/java/lang/System.html
importPackage(java.lang)

System.out.println("標準出力です。以下、5回出力をします。");
for(var i = 0; i < 5; i ++) {
	System.out.println("+ 出力(i=" + i + ")");
}
