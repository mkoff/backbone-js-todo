var app = app || {};

// Настройка localStorage
var Store = function(name) {
  this.name = name;
  var store = localStorage.getItem(this.name);
  this.data = (store && JSON.parse(store)) || {};
};
// Базовая модель
app.Todo = Backbone.Model.extend({
    defaults: {
        title: 'нет заголовка',
        description: 'нет описания',
        ready: 'В работе'
    }
});
//Коллекция моделей
var TodoModelCollection = Backbone.Collection.extend({
    model: app.Todo,
    localStorage: new Store('todos-backbone'),
	sortParam: 'ready', // Сортировка
	comparator : function(a,b){
		if(a.get(this.sortParam) > b.get(this.sortParam)){
			return -1;
		}
		if(a.get(this.sortParam) < b.get(this.sortParam)){
			return 1;
		}
		return 0;
	}
});

app.Todos = new TodoModelCollection; // Общая коллекция

// Общий вид
var TodoModelCollectionView = Backbone.View.extend({

    events: {
        'click #buttonAdd': 'buttonAdd' // добавляем в коллекцию модель
    },

    initialize: function() {
        this.template = _.template($('#viewTodos').html()); // шаблон
        this.$el.html(this.template()); //помещаем в элемент
        this.localStorageNew(); // Добавляем элементы из локального хранилища
        this.listenTo(app.Todos, 'add', this.addOne); // Слушаем события добавления
    },

    localStorageNew: function(){
        setTimeout(function(){app.Todos.add(JSON.parse(localStorage.getItem('app-todos')));},0); 
        app.Todos.sort();
    },

    buttonAdd: function() {
        app.Todos.add({
            title: $('input[name="title"]').val().replace(/</g, '&lt;') || 'нет заголовка',
            description: $('input[name="description"]').val().replace(/</g, '&lt;') || 'нет описания',
        });
        $('input[name="title"], input[name="description"]').val('');
    },

    addOne: function(model) { // Обновляет view
        var view = new TodoView({ model: model });
        localStorage.setItem('app-todos', JSON.stringify(app.Todos.toJSON()));
        app.Todos.sort();
        this.$('.wrapper__list-all').prepend(view.render());
    }
});


// Вид для поля
var TodoView = Backbone.View.extend({
    tagName: 'li',
    events: {
        'click .closeList': 'deleteRow',
        'blur .title, .desc': 'editValue', //смена фокуса на name and size
        'click #butReady' : 'butReady'
    },
    template: _.template($('#viewTodo').html()),
    initialize: function() {
        this.listenTo(this.model, 'change', this.render); // при каждом изменении модели выполнять render
        this.listenTo(this.model, 'destroy', this.remove); // если событие destroy , то удалять view
    },
    render: function() {
        this.$el.html(this.template(this.model.toJSON()));
        localStorage.setItem('app-todos', JSON.stringify(app.Todos.toJSON()));
        this.butReadyLocal();
        return this.$el;
    },
    deleteRow: function() { // Удаление строки
        this.model.destroy();
        localStorage.setItem('app-todos', JSON.stringify(app.Todos.toJSON()));
    },
    editValue: function() {
        var res = this.model.set({
            title: this.$('.title').text(),
            description: this.$('.desc').text()
        });
        if (!res) {
            this.render();
        }
    },
    //Работа с кнопкой 
    butReady:function(){
    	app.Todos.sort();
    	if(this.model.get('ready') === "Готово"){
	    	this.model.set({ready:'В работе'});
	    	this.$('#butReady').val('В работе');
            $('.wrapper__list-all').prepend(this.$el);
    	}else{
	    	this.model.set({ready:'Готово'});
	    	this.$('#butReady').val('Готово'); 	
            $('.wrapper__list-all').append(this.$el);	
    	}
        localStorage.setItem('app-todos', JSON.stringify(app.Todos.toJSON()));
    },
    butReadyLocal: function(){
        app.Todos.sort();
        if(this.model.get('ready') === "Готово"){
            this.$('#butReady').val('Готово');
        }else{
            this.$('#butReady').val('В работе');          
        }
    }

});



$(function() {
    var todoModelCollectionView = new TodoModelCollectionView({
        el: '#wrapper'
    });

    document.onkeyup = function (e) {
        if (e.keyCode === 13) {
            $('#buttonAdd').trigger('click');
        }
    }

});