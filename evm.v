
module evm (
    input wire clk,
    input wire reset,

    input wire vote1,
    input wire vote2,
    input wire vote3,
    input wire vote4,

    input wire show_results,

    output reg [7:0] candidate1_votes,
    output reg [7:0] candidate2_votes,
    output reg [7:0] candidate3_votes,
    output reg [7:0] candidate4_votes,

    output reg results_mode
);

    // Current and previous voting button states
    wire [3:0] buttons;
    reg [3:0] previous_buttons;

    assign buttons = {vote4, vote3, vote2, vote1};

    // Record votes and control result mode
    always @(posedge clk or posedge reset) begin
        if (reset) begin
            candidate1_votes <= 0;
            candidate2_votes <= 0;
            candidate3_votes <= 0;
            candidate4_votes <= 0;

            previous_buttons <= 4'b0000;
            results_mode <= 0;
        end
        else begin
            // Remember button states to detect new presses
            previous_buttons <= buttons;

            // Once enabled, result mode remains active
            if (show_results)
                results_mode <= 1;

            // Accept votes only before results are displayed.
            // One candidate can receive a vote per clock cycle.
            if (!results_mode && !show_results) begin
                if (buttons[0] && !previous_buttons[0])
                    candidate1_votes <= candidate1_votes + 1;

                else if (buttons[1] && !previous_buttons[1])
                    candidate2_votes <= candidate2_votes + 1;

                else if (buttons[2] && !previous_buttons[2])
                    candidate3_votes <= candidate3_votes + 1;

                else if (buttons[3] && !previous_buttons[3])
                    candidate4_votes <= candidate4_votes + 1;
            end
        end
    end

endmodule
