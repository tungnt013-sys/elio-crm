"use client";

import { DndContext, DragEndEvent, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { useEffect, useMemo, useState } from "react";
import { LossReason, Stage } from "@prisma/client";
import { LossReasonModal } from "@/components/loss-reason-modal";
import { StudentQuickView, QuickViewCard } from "@/components/student-quick-view";
import { OPEN_STAGES, stageLabel } from "@/lib/stage";

type StageCard = {
  id: string;
  stage: Stage;
  enteredAt: string;
  student: {
    id: string;
    fullName: string;
    parents: { fullName: string }[];
  };
  assignedTo: { name: string };
};

type StageMap = Record<Stage, StageCard[]>;

function isOverdue(stage: Stage, enteredAt: string): boolean {
  const elapsedMs = Date.now() - new Date(enteredAt).getTime();
  const elapsedDays = elapsedMs / (24 * 3600 * 1000);
  if (stage === "S1") return elapsedDays > 2;
  if (stage === "S8") return elapsedDays > 1;
  return false;
}

function daysInStage(enteredAt: string): number {
  return Math.floor((Date.now() - new Date(enteredAt).getTime()) / (24 * 3600 * 1000));
}

function DroppableColumn({
  stage,
  children,
  count,
}: {
  stage: Stage;
  children: React.ReactNode;
  count: number;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: stage });

  return (
    <div
      ref={setNodeRef}
      className="kanban-col"
      style={{
        background: isOver ? "rgba(0, 122, 255, 0.05)" : undefined,
        borderColor: isOver ? "rgba(0, 122, 255, 0.28)" : undefined,
        transition: "background 140ms ease, border-color 140ms ease",
      }}
    >
      <div className="kanban-col-header">
        <span className="kanban-col-label">{stageLabel(stage)}</span>
        {count > 0 && <span className="kanban-count">{count}</span>}
      </div>
      <div style={{ display: "grid", gap: 8 }}>{children}</div>
    </div>
  );
}

function DraggableCard({ item, onSelect }: { item: StageCard; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: item.id });
  const overdue = isOverdue(item.stage, item.enteredAt);
  const days = daysInStage(item.enteredAt);

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.55 : 1,
    zIndex: isDragging ? 999 : undefined,
    transition: isDragging ? "none" : "box-shadow 140ms ease, transform 140ms ease",
    cursor: "pointer",
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      className={`kanban-card${overdue ? " is-overdue" : ""}`}
      style={style}
      onClick={onSelect}
      {...listeners}
      {...attributes}
    >
      <div className="kanban-card-name">{item.student.fullName}</div>
      <div className="kanban-card-meta">
        <div>{item.student.parents[0]?.fullName ?? "No parent"}</div>
        <div style={{ marginTop: 1, opacity: 0.8 }}>{item.assignedTo.name}</div>
      </div>
      <div className="kanban-card-footer">
        <span
          style={{
            fontSize: 10.5,
            color: overdue ? "var(--danger)" : "var(--ink-3)",
            fontWeight: 500,
          }}
        >
          {days === 0 ? "Today" : days === 1 ? "1 day" : `${days} days`}
        </span>
        {overdue && <span className="badge badge-danger">Overdue</span>}
      </div>
    </div>
  );
}

export function PipelineKanban() {
  const [board, setBoard] = useState<StageMap | null>(null);
  const [pendingMove, setPendingMove] = useState<{ cardId: string; target: Stage } | null>(null);
  const [lossReason, setLossReason] = useState<LossReason | "">("");
  const [lossDetail, setLossDetail] = useState("");
  const [selectedCard, setSelectedCard] = useState<QuickViewCard | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  useEffect(() => {
    fetch("/api/pipeline")
      .then((r) => r.json())
      .then((data) => setBoard(data));
  }, []);

  const totalActive = useMemo(() => {
    if (!board) return 0;
    return OPEN_STAGES.reduce((sum, stage) => sum + (board[stage]?.length ?? 0), 0);
  }, [board]);

  async function applyMove(cardId: string, target: Stage, reason?: LossReason, detail?: string) {
    await fetch(`/api/pipeline/${cardId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ stage: target, lossReason: reason, lossReasonDetail: detail }),
    });
    const latest = await fetch("/api/pipeline").then((r) => r.json());
    setBoard(latest);
  }

  function handleDragEnd(event: DragEndEvent) {
    const fromCardId = String(event.active.id);
    const toStage = event.over?.id as Stage | undefined;
    if (!toStage || !OPEN_STAGES.includes(toStage)) return;

    if (["S11", "S12", "S13"].includes(toStage)) {
      setPendingMove({ cardId: fromCardId, target: toStage });
      return;
    }

    void applyMove(fromCardId, toStage);
  }

  if (!board) {
    return (
      <div
        className="panel"
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          color: "var(--ink-2)",
          fontSize: 14,
        }}
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ animation: "spin 1s linear infinite" }}>
          <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="1.5" strokeDasharray="28" strokeDashoffset="10" />
        </svg>
        <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        Loading pipeline…
      </div>
    );
  }

  return (
    <>
      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="kanban-grid">
          {OPEN_STAGES.map((stage) => (
            <DroppableColumn key={stage} stage={stage} count={(board[stage] ?? []).length}>
              {(board[stage] ?? []).map((item) => (
                <DraggableCard key={item.id} item={item} onSelect={() => setSelectedCard(item)} />
              ))}
            </DroppableColumn>
          ))}
        </div>
      </DndContext>

      <LossReasonModal
        open={Boolean(pendingMove)}
        value={lossReason}
        detail={lossDetail}
        onValueChange={setLossReason}
        onDetailChange={setLossDetail}
        onCancel={() => {
          setPendingMove(null);
          setLossReason("");
          setLossDetail("");
        }}
        onSubmit={() => {
          if (!pendingMove || !lossReason) return;
          void applyMove(pendingMove.cardId, pendingMove.target, lossReason, lossDetail);
          setPendingMove(null);
          setLossReason("");
          setLossDetail("");
        }}
      />

      <div
        className="panel"
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}
      >
        <div>
          <span className="section-title">Pipeline Summary</span>
          <span className="muted" style={{ fontSize: 13, marginLeft: 10 }}>
            {totalActive} active {totalActive === 1 ? "record" : "records"}
          </span>
        </div>
      </div>

      {selectedCard && (
        <StudentQuickView card={selectedCard} onClose={() => setSelectedCard(null)} />
      )}
    </>
  );
}
