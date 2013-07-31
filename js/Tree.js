var Tree = {
   div:null,
   maps:null,
   reader:null,

   /* Selectionne tous les li d'un type */
   checkType:function(type){
      this.div.jstree("check_node",$('li[rel="' + type + '"]'))
   },
   uncheckType:function(type){
      this.div.jstree("uncheck_node",$('li[rel="' + type + '"]'))
   },
   showObject:function(data){
      switch(data.placemarkType){
         case "FOLDER" :
            // on check les fils
            $(data.folders).each(function(){
               Tree.showObject(this);
            });
            $(data.placemarks).each(function(){
               Tree.showObject(this);
            });
            break;
         case "POINT" :
            break;
         case "POLYGON" :
            this.maps.showZone(data);
            break;
         case "LINE" :
            this.maps.showLine(data);
            break;
         default:break;
      }
   },
   hideObject:function(data){
      switch(data.placemarkType){
         case "FOLDER" :
            // on check les fils
            $(data.folders).each(function(){
                Tree.hideObject(this);
             });
             $(data.placemarks).each(function(){
                Tree.hideObject(this);
             });
            break;
         case "POINT" :
            break;
         case "POLYGON" :
         	this.maps.hideZone(data);
            break;
         case "LINE" :
            this.maps.hideLine(data);
            break;
         default:break;
      }
   },
   checkEvent:function(htmlObject){
      var data = htmlObject.data("obj");
      //var t = new Date().getTime();
      this.showObject(data);
      //console.log((new Date().getTime() - t)/1000 + " s");
   },
   uncheckEvent:function(htmlObject){
		var data = htmlObject.data("obj");
      this.hideObject(data);
   },
   /* Construit la liste a puces */
   buildTree:function(){
      var options = {
   		"plugins" : ["themes","html_data","ui","checkbox","types"] ,
   		"types":{}
   	};
      options.types.types = Types.getTypesIcon();
      var ul = this.buildFolderTree(this.reader.topFolder);
   	this.div.empty().append(ul);
   	this.div.bind('check_node.jstree',function(a,b){
		 $(b.rslt.obj).each(function(){Tree.checkEvent($(this));});
      }).bind('uncheck_node.jstree',function(a,b){
         $(b.rslt.obj).each(function(){Tree.uncheckEvent($(this));});
      }).jstree(options);
   },
   /* On construit la liste html de l'arbre */
   buildFolderTree:function(folder){
	   	// on parse les folders, les placemark
	   	var ul = $('<ul></ul>');
		var liTitle = $('<li rel="folder"><a href="#">' + folder.nom + '</a></li>');
      liTitle.data("obj",folder);
	   	ul.append(liTitle);
	   	$(folder.folders).each(function(){
	   		liTitle.append(Tree.buildFolderTree(this));
	   	});
		if(folder.placemarks.length > 0){
			var ulPL = $('<ul></ul>');
	   	$(folder.placemarks).each(function(){
				if(this.placemarkType == 'POLYGON'){
					// On affiche un carre de couleur devant le titre
					this.type=this.getStyleName();
				}
			   var li = $('<li rel="' + this.type + '"><a href="#">' + this.nom + '</a></li>');
            		   li.data("obj",this);
		   	   ulPL.append(li);
	   	});
	   	liTitle.append(ulPL);
		}
	   	return ul;
   },

   init:function(reader,maps,id){
      this.reader = reader;
      this.maps = maps;
      this.div = $('#' + id);
      this.buildTree();
   }
};
