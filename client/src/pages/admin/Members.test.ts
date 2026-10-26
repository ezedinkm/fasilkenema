import { afterAll, beforeEach, describe, expect, it } from "bun:test";
import { Window } from "happy-dom";

const browser = new Window({ url: "http://localhost/" });
const globals = globalThis as unknown as Record<string, unknown>;
Object.assign(globals, {
  window: browser,
  document: browser.document,
  navigator: browser.navigator,
  HTMLElement: browser.HTMLElement,
  DocumentFragment: browser.DocumentFragment,
  Node: browser.Node,
  MutationObserver: browser.MutationObserver,
  getComputedStyle: browser.getComputedStyle.bind(browser),
  localStorage: browser.localStorage,
  IS_REACT_ACT_ENVIRONMENT: true,
});

const React = await import("react");
const { act } = await import("react");
const { createRoot } = await import("react-dom/client");

// Keep these page tests focused on member loading rather than admin shell behavior.
import { mock } from "bun:test";
mock.module("@/components/AdminLayout", () => ({
  default: ({ children }: { children: unknown }) => children,
}));
mock.module("@/hooks/use-toast", () => ({
  useToast: () => ({ toast: () => {} }),
}));

const { default: AdminMembers } = await import("./Members");
const container = browser.document.createElement("div");
browser.document.body.append(container);
const root = createRoot(container);

let memberResponse: Response;

beforeEach(() => {
  memberResponse = new Response(
    JSON.stringify({ error: "Members are temporarily unavailable" }),
    { status: 503, headers: { "Content-Type": "application/json" } },
  );
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    if (String(input) === "/api/admin/membership-tiers") {
      return new Response("[]", {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    if (String(input) === "/api/members") return memberResponse;
    throw new Error(`Unexpected request: ${String(input)}`);
  }) as typeof fetch;
});

afterAll(async () => {
  await act(async () => root.unmount());
  browser.happyDOM.abort();
});

describe("AdminMembers loading errors", () => {
  it("shows the API error and retry action instead of crashing on invalid data", async () => {
    await act(async () => {
      root.render(React.createElement(AdminMembers));
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain(
      "Members are temporarily unavailable",
    );
    expect(
      Array.from(container.querySelectorAll("button")).some((button) =>
        button.textContent?.includes("Try again"),
      ),
    ).toBe(true);

    memberResponse = new Response("{}", {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
    const retryButton = Array.from(
      container.querySelectorAll("button"),
    ).find((button) => button.textContent?.includes("Try again"));
    if (!retryButton) throw new Error("Retry button was not rendered");

    await act(async () => {
      retryButton.dispatchEvent(
        new browser.MouseEvent("click", { bubbles: true }),
      );
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain(
      "The members response was invalid. Please try again.",
    );
    expect(container.textContent).toContain("Try again");
  });
});
