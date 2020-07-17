


const {
    exec,
    escape
} = require('../../../Config/DB_MySql');

const log4js= require('../../../Logs/log4js');

//index左侧菜单加载
async function  system_navs(option){
    let rows;
    try {
        rows= await  exec(" call p_system_navs(?) ",option)
        rows=navstoTree(rows[0])
        return  {code:200,success:true,msg:"",data:rows}
    } catch (error) {
        return {code:9999,success:false,msg:"异常错误",data:null};
    }
}
//菜单显示
async function  system_menu(option){
    let rows;
    try {
		rows= await  exec(" call p_system_menu()",option);
        // rows=navstoTree(rows[0])
        return  {code:200,success:true,msg:"",data:rows[0]}
    } catch (error) {
        return {code:9999,success:false,msg:"异常错误",data:null};
    }
}
// 菜单排序
async function  system_menu_sort(option){
    let rows;
    try {
		rows= await exec(" call p_system_menu_sort(?,?,?,?)",option)
		// console.log(rows)
		console.log(rows[0])
		if(rows[0][0].num1==1 && rows[0][0].num2==1 ){
			return  {code:200,success:true,msg:"排序成功",data:[]}
		}else{
			return  {code:0,success:false,msg:"排序失败",data:[]}
		}
    } catch (error) {
        return {code:9999,success:false,msg:"异常错误",data:null};
    }
}


// 菜单状态更改
function  system_menu_status(option){
       return	exec("update system_menu set `status`=? where id=?",option).then((data)=>{
		   if(data.affectedRows>0){
			return true;
		   }
		   return false;
	    }).catch((err)=>{
			console.log(err);
			log4js.logerrway(err );
	    	return false;
	    })
}




// 菜单删除
function  system_menu_del(option){
	return	exec("delete from  system_menu  where id=?",option).then((data)=>{
		if(data.affectedRows>0){
		 return true;
		}
		return false;
	 }).catch((err)=>{
		 console.log(err);
		 log4js.logerrway(err );
		 return false;
	 })
}

// 菜单子项添加
function  system_menu_add(option){
	return	exec("insert into system_menu(parent_id,title,icon,path,`status`,type,`order`) values(?,?,?,?,?,0,1)"
	,option).then((data)=>{
		if(data.affectedRows>0){
		 return true;
		}
		return false;
	 }).catch((err)=>{
		 console.log(err);
		 log4js.logerrway(err );
		 return false;
	 })
}

// 菜单子项编辑
function  system_menu_edit(option){
	return	exec("update system_menu set  title=?,icon=?,path=?, `status`=?,`order`=? where id=?"
	,option).then((data)=>{
		if(data.affectedRows>0){
		 return true;
		}
		return false;
	 }).catch((err)=>{
		 console.log(err);
		 log4js.logerrway(err );
		 return false;
	 })
}



// 菜单添加  创建一级菜单（是否具有子集）
function  system_menu_addmenu(option){
	return	exec("insert into system_menu(parent_id,title,icon,path,`status`,type,`order`) values(0,?,?,?,1,?,1)"
	,option).then((data)=>{
		if(data.affectedRows>0){
		 return true;
		}
		return false;
	 }).catch((err)=>{
		 console.log(err);
		 log4js.logerrway(err );
		 return false;
	 })
}




module.exports = {
	system_navs,
	system_menu,
	system_menu_sort,
	system_menu_status,
	system_menu_del,
	system_menu_add,
	system_menu_edit,
	system_menu_addmenu
}



//-------------------------------------------------【公共事件】---------------------------------------------
//菜单专用格式转换----页面刷新
function navstoTree(data) {
	// 删除 所有 children,以防止多次调用
	data.forEach(function (item) {
		delete item.children;
	});
	// 将数据存储为 以 id 为 KEY 的 map 索引数据列
	var map = {};
	data.forEach(function (item) {
		map[item.id] = item;
	});
	var val = [];
	data.forEach(function (item) {
		// 以当前遍历项，的pid,去map对象中找到索引的id
		var parent = map[item.parent_id];
		// 好绕啊，如果找到索引，那么说明此项不在顶级当中,那么需要把此项添加到，他对应的父级中
		if (parent) {
			(parent.children || ( parent.children = [] )).push(item);
		} else {
			//如果没有在map中找到对应的索引ID,那么直接把 当前的item添加到 val结果集中，作为顶级
			item["ischeck"]=(item.ischeck==1?true:false);
			item["spread"]=(item.spread==1?true:false);
			val.push(item);
		}
	});
	return val;
}
