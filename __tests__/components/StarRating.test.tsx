import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StarRating from "@/components/StarRating";

describe("StarRating", () => {
  it("renders stars for a given value", () => {
    render(<StarRating value={4.5} />);
    expect(screen.getByText("4.5")).toBeDefined();
    expect(screen.getByTitle("4.5 分")).toBeDefined();
  });

  it("shows placeholder for null", () => {
    render(<StarRating value={null} />);
    expect(screen.getByText("暂无评分")).toBeDefined();
  });
});
