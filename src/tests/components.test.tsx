import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SideQuestApp } from "@/components/layout/sidequest-app";
import { QuestCard } from "@/components/quests/quest-card";
import type { AppState } from "@/domain/types";
import type { StateRepository } from "@/lib/storage";
import { onboardedState, questFromTemplate, withActive } from "./helpers";

function memoryRepository(state: AppState | null): StateRepository & { saved: AppState[]; clear: ReturnType<typeof vi.fn> } {
  const saved: AppState[] = [];
  return {
    saved,
    load: () => (state ? { status: "ok", state } : { status: "empty" }),
    save: (next) => {
      saved.push(next);
      return true;
    },
    clear: vi.fn(() => true),
  };
}

describe("QuestCard", () => {
  it("shows rarity, title, duration, reward and an accept action", async () => {
    const quest = questFromTemplate("golden-hour");
    const onAccept = vi.fn();
    render(<QuestCard quest={quest} onAccept={onAccept} />);

    const card = screen.getByRole("article", { name: "Golden Hour" });
    expect(within(card).getByText("Rare")).toBeInTheDocument();
    expect(within(card).getByText("Outdoors")).toBeInTheDocument();
    expect(within(card).getByText("45 min")).toBeInTheDocument();
    expect(within(card).getByText("150 XP")).toBeInTheDocument();

    await userEvent.click(within(card).getByRole("button", { name: /accept quest/i }));
    expect(onAccept).toHaveBeenCalledWith(quest);
  });
});

describe("SideQuestApp", () => {
  it("onboards a new player onto the quest board", async () => {
    const user = userEvent.setup();
    render(<SideQuestApp repository={memoryRepository(null)} />);

    const input = await screen.findByLabelText(/what should we call you/i);
    expect(input).toHaveValue("Adventurer");
    await user.clear(input);
    await user.type(input, "Robin");
    await user.click(screen.getByRole("button", { name: /begin adventure/i }));

    expect(await screen.findByRole("heading", { name: "Hey, Robin." })).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /accept quest/i })).toHaveLength(3);
  });

  it("accepting a quest makes it the active quest", async () => {
    const user = userEvent.setup();
    const state = onboardedState();
    const target = state.availableQuests[0];
    render(<SideQuestApp repository={memoryRepository(state)} />);

    await user.click(await screen.findByRole("button", { name: `Accept quest: ${target.title}` }));

    const active = await screen.findByRole("region", { name: target.title });
    expect(within(active).getByText("Active quest")).toBeInTheDocument();
    expect(within(active).getByRole("button", { name: /complete quest/i })).toBeInTheDocument();
    expect(within(active).getByRole("button", { name: /abandon quest/i })).toBeInTheDocument();
  });

  it("completing a quest celebrates the XP earned and persists it", async () => {
    const user = userEvent.setup();
    const repo = memoryRepository(withActive(onboardedState(), "scenic-route"));
    render(<SideQuestApp repository={repo} />);

    await user.click(await screen.findByRole("button", { name: /complete quest/i }));
    const confirm = await screen.findByRole("dialog", { name: /quest complete\?/i });
    expect(within(confirm).getByText(/did you complete this quest in the real world/i)).toBeInTheDocument();
    await user.click(within(confirm).getByRole("button", { name: /yes, claim xp/i }));

    const celebration = await screen.findByRole("dialog", { name: "Quest complete" });
    expect(within(celebration).getByText("You earned 80 XP.")).toBeInTheDocument();
    expect(within(celebration).getByText("First Steps")).toBeInTheDocument();
    await waitFor(() => expect(repo.saved.at(-1)?.player.totalXp).toBe(80));

    await user.click(within(celebration).getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(screen.queryByRole("dialog", { name: "Quest complete" })).not.toBeInTheDocument());
  });

  it("reset only happens after explicit confirmation", async () => {
    const user = userEvent.setup();
    const repo = memoryRepository(onboardedState());
    render(<SideQuestApp repository={repo} />);

    await user.click(await screen.findByRole("button", { name: /open settings/i }));
    await user.click(await screen.findByRole("button", { name: /reset all progress/i }));

    const confirm = await screen.findByRole("alertdialog", { name: /reset all progress\?/i });
    expect(within(confirm).getByText(/permanently removes/i)).toBeInTheDocument();
    expect(repo.clear).not.toHaveBeenCalled();

    // Cancelling keeps everything.
    await user.click(within(confirm).getByRole("button", { name: /cancel/i }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(repo.clear).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /reset all progress/i }));
    await user.click(await screen.findByRole("button", { name: /yes, reset everything/i }));
    expect(repo.clear).toHaveBeenCalledTimes(1);
    expect(await screen.findByRole("button", { name: /begin adventure/i })).toBeInTheDocument();
    expect(screen.getByText(/progress reset/i)).toBeInTheDocument();
  });

  it("shows a friendly notice instead of crashing on corrupt storage", async () => {
    const repo: StateRepository = { load: () => ({ status: "corrupt" }), save: () => true, clear: () => true };
    render(<SideQuestApp repository={repo} />);
    expect(await screen.findByText(/couldn't be read/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /begin adventure/i })).toBeInTheDocument();
  });
});
