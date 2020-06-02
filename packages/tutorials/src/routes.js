import CounterStarter from "tutorials/1_counter/starter"
import CounterComplete from "tutorials/1_counter/complete"
import ToggleStarter from "tutorials/2_toggle/starter"
import ToggleComplete from "tutorials/2_toggle/complete"
import InputStarter from "tutorials/3_input/starter"
import InputComplete from "tutorials/3_input/complete"
import TodoStarter from "tutorials/todo/starter"
import TodoComplete from "tutorials/todo/complete"
import TodosStarter from "tutorials/todos/starter"
import TodosComplete from "tutorials/todos/complete"
import TimerStarter from "tutorials/timer/starter"
import TimerComplete from "tutorials/timer/complete"

export default [
  {
    name: "counter",
    Starter: CounterStarter,
    Complete: CounterComplete,
  },
  {
    name: "toggle",
    Starter: ToggleStarter,
    Complete: ToggleComplete,
  },
  {
    name: "input",
    Starter: InputStarter,
    Complete: InputComplete,
  },
  {
    name: "todo",
    Starter: TodoStarter,
    Complete: TodoComplete,
  },
  {
    name: "todos",
    Starter: TodosStarter,
    Complete: TodosComplete,
  },
  {
    name: "timer",
    Starter: TimerStarter,
    Complete: TimerComplete,
  },
]
