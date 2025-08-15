import BottomMenu from './components/BottomMenu';


export default function AppLayout({ children, isLoggedIn }) {
  return (
    <div className="app-layout">
    <main>{children}</main>
      <BottomMenu isLoggedIn={isLoggedIn} />
    </div>
  );
}