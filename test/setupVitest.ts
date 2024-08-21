// TODO: do we need to import `cleanup as teardown`?
import { setup } from "@ark/attest";

export default () => setup({ updateSnapshots: true });
