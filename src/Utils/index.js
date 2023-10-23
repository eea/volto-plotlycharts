import Download from './Download/Download';
import Sources from './Sources/Sources';

export { Download, Sources };

export function withServerOnly(WrappedComponent) {
  function WithServerOnly(props) {
    return __SERVER__ ? null : <WrappedComponent {...props} />;
  }
  return WithServerOnly;
}
