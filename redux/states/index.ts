import counterConnector from "./counter";
import attemptCounterConnector from "./attemptCounter";

export {
    add,
    reduce,
    set,
} from "./counter";

export {
    addSuccess,
    addFailed,
    setSuccess,
    setFailed,
    reset,
} from "./attemptCounter";

export const reducer = {
    counter: counterConnector,
    attemptCounter: attemptCounterConnector,
}

export default reducer;