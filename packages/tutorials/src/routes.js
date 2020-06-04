import CounterStarter from "tutorials/1_counter/starter"
import CounterComplete from "tutorials/1_counter/complete"
import ToggleStarter from "tutorials/2_toggle/starter"
import ToggleComplete from "tutorials/2_toggle/complete"
import InputStarter from "tutorials/3_input/starter"
import InputComplete from "tutorials/3_input/complete"
import TodoStarter from "tutorials/4_todo/starter"
import TodoComplete from "tutorials/4_todo/complete"
import TodosStarter from "tutorials/5_todos/starter"
import TodosComplete from "tutorials/5_todos/complete"
import StopwatchStarter from "tutorials/6_stopwatch/starter"
import StopwatchComplete from "tutorials/6_stopwatch/complete"
import TimerStarter from "tutorials/7_timer/starter"
import TimerComplete from "tutorials/7_timer/complete"
import TilesStarter from "tutorials/8_tiles/starter"
import TilesComplete from "tutorials/8_tiles/complete"

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
    name: "stopwatch",
    Starter: StopwatchStarter,
    Complete: StopwatchComplete,
  },
  {
    name: "timer",
    Starter: TimerStarter,
    Complete: TimerComplete,
  },
  {
    name: "tiles",
    Starter: TilesStarter,
    Complete: TilesComplete,
  },
]
