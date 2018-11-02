$(document).ready(function(){
  alert("hello world");
if(window.location.href=="http://hanqingguo.github.io")
{
$("#sidebar").css({width:'100%'});
$("#btnblog").click(function(){
$("#sidebar").animate({width:'12%'},'slow');
});
}
});
