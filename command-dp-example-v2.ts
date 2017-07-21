/**
 * Command interface as a representation of available methods
 */
interface Command {
    execute(): void;
    undo(): void;
}

interface ModifyCommandConfig {
    receiver: object;
    changedValue: string;
    modificationType: string;
}

interface ConcreteCommandConfig {
    receiver: HTMLElement,
    changedValue: string;
}
/**
 * ModifyCommand class which implements Command interface.
 * This is usually an abstract class because it never has to be instantiated.
 * This class contains whole logic of command execution.
 */
class ModifyCommand implements Command {
    private previousValue: string;

    constructor(private config: ModifyCommandConfig) {};

    public execute(): void {
        this.previousValue = this.config.receiver[this.config.modificationType];
        this.config.receiver[this.config.modificationType] = this.config.changedValue;
    }

    public undo(): void {
        this.config.receiver[this.config.modificationType] = this.previousValue;
    }
}
/**
 * ChangeTextCommand, ChangeTextColorCommand and ChangeFontSizeCommand which is taking object with four parameters in the constructor -
 * receiver (element which will be modified),
 * changedValue - new value to which will be set given parameter of an receiver,
 * modificationType - it stands for concrete property which value is going to be modified,
 * parameterForModification - an object which contains parameter which is going to be modified
 */
class ChangeTextCommand extends ModifyCommand {
    constructor(concreteCommandConfig: ConcreteCommandConfig) {
        super({
            receiver: concreteCommandConfig.receiver,
            changedValue: concreteCommandConfig.changedValue,
            modificationType: 'textContent'
        });
    }
}

class ChangeTextColorCommand extends ModifyCommand {
    constructor(concreteCommandConfig: ConcreteCommandConfig) {
        super({
            receiver: concreteCommandConfig.receiver.style,
            changedValue: concreteCommandConfig.changedValue,
            modificationType: 'color'
        });
    }
}

class ChangeFontSizeCommand extends ModifyCommand {
    constructor(concreteCommandConfig: ConcreteCommandConfig) {
        super({
            receiver: concreteCommandConfig.receiver.style,
            changedValue: concreteCommandConfig.changedValue,
            modificationType: 'fontSize'
        });
    }
}


/**
 * Invoker class executes concrete command by using it's execute() method and
 * stores information about already executed commands and current command state.
 * Because of this it gives us possibility to undo/redo invoked commands sequence.
 */
class Invoker {
    private executedCommands: Array<Command> = [];
    private currentExecutionState: number = -1;

    constructor() {};

    public execute (command: Command): void {
        if (this.executedCommands.length - 1 > this.currentExecutionState) {
            let nextCommand: number = this.currentExecutionState + 1;
            this.executedCommands.splice(nextCommand, this.executedCommands.length - nextCommand);
        }

        this.executedCommands.push(command);
        command.execute();
        this.currentExecutionState = this.executedCommands.length - 1;
    }

    public undo () {
        if (this.currentExecutionState >= 0) {
            this.executedCommands[this.currentExecutionState--].undo();
        }
    }

    public redo () {
        if (this.currentExecutionState < this.executedCommands.length - 1) {
            this.executedCommands[++this.currentExecutionState].execute();
        }
    }
}

window.addEventListener('load', (ev) => {

    let mainContainer: HTMLElement = <HTMLElement>document.querySelector('main');

    let redoButton: HTMLElement = <HTMLElement>mainContainer.querySelector('.redo-button');
    let undoButton: HTMLElement = <HTMLElement>mainContainer.querySelector('.undo-button');

    let changeColorButton: HTMLElement = <HTMLElement>mainContainer.querySelector('.changeColor-button');
    let changeFontSizeButton: HTMLElement = <HTMLElement>mainContainer.querySelector('.changeFontSize-button');
    let changeTextButton: HTMLElement = <HTMLElement>mainContainer.querySelector('.changeText-button');
    /**
     * Receiver
     * @type {HTMLElement}
     */
    let mainText: HTMLElement = mainContainer.querySelector('h5');

    let increaseFontSizeCommand: Command = new ChangeFontSizeCommand({ receiver: mainText, changedValue: '25px' });
    let changeColorToBlueCommand: Command = new ChangeTextColorCommand({ receiver: mainText, changedValue: 'blue' });
    let changeTextCommand: Command = new ChangeTextCommand({ receiver: mainText, changedValue: 'TEXT HAS BEEN CHANGED' });
    let invoker: Invoker = new Invoker();

    attachChangeEvents({
        command: changeColorToBlueCommand,
        actionButton: changeColorButton,
        receiver: mainText,
        invoker: invoker
    });
    attachChangeEvents({
        command: increaseFontSizeCommand,
        actionButton: changeFontSizeButton,
        receiver: mainText,
        invoker: invoker
    });
    attachChangeEvents({
        command: changeTextCommand,
        actionButton: changeTextButton,
        receiver: mainText,
        invoker: invoker
    });
    attachRedoEvent({
        actionButton: redoButton,
        invoker: invoker
    });
    attachUndoEvent({
        actionButton: undoButton,
        invoker: invoker
    });

    function attachChangeEvents (data): void {
        /**
         * Client
         */
        data.actionButton.addEventListener('click', (ev) => {
            data.invoker.execute(data.command);
        });
    }

    function attachRedoEvent (data): void {
        data.actionButton.addEventListener('click', (ev) => {
           data.invoker.redo();
        });
    }

    function attachUndoEvent (data): void {
        data.actionButton.addEventListener('click', (ev) => {
           data.invoker.undo();
        });
    }
});

