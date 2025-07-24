import Navbar from "./Navbar";

const Layout = ({ user, setUser, children }) => {
  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <main>{children}</main>
    </>
  );
};

export default Layout;
