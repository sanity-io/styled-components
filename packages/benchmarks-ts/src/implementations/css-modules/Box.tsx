import classnames from 'classnames';
import styles from './box.module.css';
import View from './View';

const Box = ({ color, fixed = false, layout = 'column', outer = false, ...other }) => (
  <View
    {...other}
    className={classnames(styles[`color${color}`], {
      [styles.fixed]: fixed,
      [styles.outer]: outer,
      [styles.row]: layout === 'row',
    })}
  />
);

export default Box;
