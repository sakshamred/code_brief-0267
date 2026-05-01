import { Route, Switch } from "wouter";
import { Provider } from "./components/provider";
import { Navbar } from "./components/navbar";
import Landing from "./pages/landing";
import SignIn from "./pages/sign-in";
import SignUp from "./pages/sign-up";
import Dashboard from "./pages/dashboard";
import History from "./pages/history";
import { AgentFeedback, RunableBadge } from "@runablehq/website-runtime";

function LandingWithNav() {
  return (
    <>
      <Navbar />
      <Landing />
    </>
  );
}

function App() {
  return (
    <Provider>
      <Switch>
        <Route path="/" component={LandingWithNav} />
        <Route path="/sign-in" component={SignIn} />
        <Route path="/sign-up" component={SignUp} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/history" component={History} />
      </Switch>
      {import.meta.env.DEV && <AgentFeedback />}
      {<RunableBadge />}
    </Provider>
  );
}

export default App;
