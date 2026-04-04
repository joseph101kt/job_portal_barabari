import { useCounter } from '@my-app/features';
import Test from './Test';

export default function HomeScreen() {
  const { count, increment, decrement } = useCounter();

  return (
    <Test/>
  );
}