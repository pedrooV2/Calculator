class CalcController {

    constructor(){
        
        //Web API
        this._audio = new Audio('click.mp3');
        this._audioOnOff = false;
        this._lastOperator = '';
        this._lastNumber = '';
        this._operation = [];
        this._locale = 'pt-BR';
        this._displayCalcEl = document.querySelector("#display");
        this._dateEl = document.querySelector("#data");
        this._timeEl = document.querySelector("#hora");
        this._currentDate;
        this.initialize();  
        this.initButtonsEvents(); 
        this.initKeyboard();
        
        // "_" dá a ideia que os atributos são privados
        /*Se eu tentar acessar esse atributo através do objeto eu consigo, porém não deveria
        pois isso não correto acontecer. Para fazer isso da maneira "correta" temos métodos 
        os get e set.*/

    }

    //Inicializa a data e a hora atual
    initialize(){

        this.setDisplayDateTime();

        setInterval(() =>{

            this.setDisplayDateTime();

        }, 1000);

        this.setLastNumberToDisplay();
        this.pasteFromClipboard();

        document.querySelectorAll('.btn-ac').forEach(btn => {

            btn.addEventListener('dblclick', e => {

                this.toggleAudio();

            });

        });

    }

    toggleAudio(){

        this._audioOnOff = !this._audioOnOff;
        
    }

    playAudio(){

        if(this._audioOnOff){

            this._audio.currentTime = 0;
            this._audio.play();

        }

    }

    //Copia uma informação quando eu pressiono ctrl + C
    copyToClipboard(){

        let input = document.createElement('input');
        
        input.value = this.displayCalc;
        
        document.body.appendChild(input);
        
        input.select();

        document.execCommand("Copy");

        input.remove();

    }

    //Cola a informação no display.
    pasteFromClipboard(){

        document.addEventListener('paste', e =>{

            let text = e.clipboardData.getData('Text');

            this.displayCalc = parseFloat(text);
            this.addOperation(parseFloat(text));

        })

    } 

    //Tratando eventos de teclado
    initKeyboard(){

        document.addEventListener('keyup', e => {

            this.playAudio();

            switch (e.key) {
                case 'Escape':
                    this.clearAll();
                    break;
                
                case 'Backspace':
                    this.clearEntry();
                    break;
    
                case '+':
                case '-':
                case '*':
                case '/':
                case '%':
                    this.addOperation(e.key);
                    break;
    
                case 'Enter':
                case '=':
                    this.calc();
                    break;
    
                case '.':
                case ',':
                    this.addDot('.');
                    break;
    
                case '0':
                case '1':
                case '2':
                case '3':
                case '4':
                case '5':
                case '6':
                case '7':
                case '8':
                case '9':
                    this.addOperation(parseInt(e.key));
                    break;

                case 'c':
                    if(e.ctrlKey) this.copyToClipboard();
                    break;
            }

        });

    }


    //Limpa toda a operação
    clearAll(){

        this._operation = [];
        this._lastNumber = '';
        this._lastOperator = '';
        this.setLastNumberToDisplay();

    }

    //limpa a ultima entrada no array
    clearEntry(){

        //pop elimina o ultimo item do array
        this._operation.pop();
        this.setLastNumberToDisplay();

    }

    //pegar ultimo item do array
    getLastOperation(){

        return this._operation[this._operation.length - 1];

    }

    setLastOperation(value){

        this._operation[this._operation.length - 1] = value;

    }

    isOperator(value){
        //Se encontrar o valor no array ele traz o indice, se não achar  devolve -1
        return (['+', '-', '*', '/', '%'].indexOf(value) > -1);
    }

    pushOperation(value){

        this._operation.push(value);
        
        if(this._operation.length > 3){

            this.calc();

        }
    }

    getResult(){

        try{
            return eval(this._operation.join(""));
        } catch(e){
            setTimeout(() => {
                this.setError();
            }, 1)
        }

    }

    //Calcula e exibe no display
    calc(){

        let last = '';

        this._lastOperator = this.getLastItem();

        if(this._operation.length < 3){

            let firstItem = this._operation[0];
            this._operation = [firstItem, this._lastOperator, this._lastNumber];

        }

        if(this._operation.length > 3){

            //Guarda a ultima operação
            last = this._operation.pop();
            this._lastNumber = this.getResult();

        } else if(this._operation.length == 3) {

            this._lastNumber = this.getLastItem(false);

        }

        //join transforma tudo em string e tira as virgulas da expressão
        let result = this.getResult();

        if(last == '%'){

            result /= 100;
            this._operation = [result];

        } else {

            this._operation = [result]; 

            if(last) this._operation.push(last);

        }

        this.setLastNumberToDisplay();  
        
    }

    getLastItem(isOperator = true){

        let lastItem;

        for(let i = this._operation.length-1; i >= 0; i--){

            if(this.isOperator(this._operation[i]) == isOperator){
                    
                lastItem = this._operation[i];
                break;
            }   
        }

        if(!lastItem){

            lastItem = (isOperator) ? this._lastOperator : this._lastNumber;

        }

        return lastItem;
    }

    setLastNumberToDisplay(){

        let lastNumber = this.getLastItem(false);

        if(!lastNumber) lastNumber = 0;

        this.displayCalc = lastNumber;

    }

    //adiciona mais itens ao array de operações
    addOperation(value){

        //Verifica se é um número. Se for string retorna true, se for num retorna false.
        if(isNaN(this.getLastOperation())){

            //String
            if(this.isOperator(value)){
            
                //Trocar o operador
                this.setLastOperation(value);

            } else {
                
                //Primeira operação que é passada no array vazio
                this.pushOperation(value);

                this.setLastNumberToDisplay();
                
            }

        } else{

            //é preciso verificar aqui tb, pois quando o ultimo item do array for um numero e eu inserir um operador ele vai cair aqui!
            if(this.isOperator(value)){

                this.pushOperation(value);

            } else {

                //Number
                let newValue = this.getLastOperation().toString() + value.toString();
                this.setLastOperation(newValue);

                //att display

                this.setLastNumberToDisplay();

            }
        }      

    }

    setError(){
        this.displayCalc = "Error";
    }

    addDot(){

        let lastOperation = this.getLastOperation();

        if(typeof lastOperation === 'string' && lastOperation.split('').indexOf('.') > -1) return;

        if(this.isOperator(lastOperation) || !lastOperation){

            this.pushOperation('0.');

        } else {

            this.setLastOperation(lastOperation.toString() + '.');

        }

        this.setLastNumberToDisplay();

    }

    execBtn(value){

        this.playAudio();

        switch (value) {
            case 'ac':
                this.clearAll();
                break;
            
            case 'ce':
                this.clearEntry();
                break;

            case 'soma':
                this.addOperation('+');
                break;

            case 'subtracao':
                this.addOperation('-');
                break;

            case 'divisao':
                this.addOperation('/');
                break;

            case 'multiplicacao':
                this.addOperation('*');
                break;

            case 'porcento':
                this.addOperation('%');
                break;

            case 'igual':
                this.calc();
                break;

            case 'ponto':
                this.addDot('.');
                break;

            case '0':
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                this.addOperation(parseInt(value));
                break;

            default:
                this.setError();
                break;
        }

    }

    
    //Function para aplicar mais de um evento
    addEventListenerAll(element, events, fn){
        
        //O split separa a string passada na função e transforma em um array. Nós precimas falar para o split o que separa uma palavra
        //da outr. No caso é um espaço que separa, então onde tiver um espaço o split vai criar um novo indice para o array.
        //Logo em seguida fazemos um forEach, porque agora ele é um array, então a cada elemento que passa adiciona um evento de
        //click e depois um de drag

        events.split(' ').forEach(event => {
            element.addEventListener(event, fn, false); //false permite que apenas a primeira camada que foi clicada dipare o evento
        })

    }

    //Configuração dos botões
    initButtonsEvents(){
        
        //querySelectorAll pega todos os elementos que eu quero consultar
        let buttons = document.querySelectorAll("#buttons > g, #parts > g");

        buttons.forEach((btn , index) => {
            
            //O "e" serve como uma variável que armazena todos os dados referente ao evento
            //'addEventListenerAll não é nativo, é um método meu!'

            this.addEventListenerAll(btn, 'click drag', e => {
                
                //Pega o nome da classe, e retira o nome "btn", deixando apenas o valor
                let textBtn = btn.className.baseVal.replace("btn-", "");

                this.execBtn(textBtn);

            });

            this.addEventListenerAll(btn, "mouseover mouseup mousedown", e =>{

                btn.style.cursor = "pointer";

            });

        });

    }

    //Pega a data e a hora atual
    setDisplayDateTime(){
        this.displayDate = this.currentDate.toLocaleDateString(this.locale, {
            day:"2-digit",
            month: "long",
            year: "numeric"
    });
        this.displayTime = this.currentDate.toLocaleTimeString(this.locale);
    }

    //Time
    get displayTime(){
        return this._timeEl.innerHTML;
    }

    set displayTime(value){
        this._timeEl.innerHTML = value;
    }

    //Date
    get displayDate(){
        return this._dateEl.innerHTML;
    }

    set displayDate(value){
        this._dateEl.innerHTML = value;
    }

    //Display
    get displayCalc(){
        return this._displayCalcEl.innerHTML;
    }

    set displayCalc(value){

        if(value.toString().length > 10) {
            this.setError();
            return false;
        }
        this._displayCalcEl.innerHTML = value;
    }

    get currentDate(){
        return new Date();
    }

    set currentDate(value){
        this._currentDate = value;
    }

}