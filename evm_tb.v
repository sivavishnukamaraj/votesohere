
`timescale 1ns/1ps

module evm_tb;

    reg clk;
    reg reset;

    reg vote1, vote2, vote3, vote4;
    reg show_results;

    wire [7:0] candidate1_votes;
    wire [7:0] candidate2_votes;
    wire [7:0] candidate3_votes;
    wire [7:0] candidate4_votes;

    wire results_mode;

    // Instantiate the EVM
    evm uut (
        .clk(clk),
        .reset(reset),

        .vote1(vote1),
        .vote2(vote2),
        .vote3(vote3),
        .vote4(vote4),

        .show_results(show_results),

        .candidate1_votes(candidate1_votes),
        .candidate2_votes(candidate2_votes),
        .candidate3_votes(candidate3_votes),
        .candidate4_votes(candidate4_votes),

        .results_mode(results_mode)
    );

    // Generate a 10 ns clock
    initial begin
        clk = 0;
        forever #5 clk = ~clk;
    end

    // Task to simulate one vote
    task cast_vote;
        input integer candidate;
        begin
            case (candidate)
                1: vote1 = 1;
                2: vote2 = 1;
                3: vote3 = 1;
                4: vote4 = 1;
            endcase

            #20;

            vote1 = 0;
            vote2 = 0;
            vote3 = 0;
            vote4 = 0;

            #20;
        end
    endtask

    // Main simulation
    initial begin
        $dumpfile("evm.vcd");
        $dumpvars(0, evm_tb);

        $monitor(
            "Time=%0t | C1=%0d C2=%0d C3=%0d C4=%0d | Results=%b",
            $time,
            candidate1_votes,
            candidate2_votes,
            candidate3_votes,
            candidate4_votes,
            results_mode
        );

        // Initialize inputs
        reset = 1;
        vote1 = 0;
        vote2 = 0;
        vote3 = 0;
        vote4 = 0;
        show_results = 0;

        #12;
        reset = 0;
        #8;

        // Simulate voting
        cast_vote(1);
        cast_vote(2);
        cast_vote(1);
        cast_vote(3);
        cast_vote(4);
        cast_vote(1);
        cast_vote(2);
        cast_vote(3);
        cast_vote(1);
        cast_vote(4);

        // Display and lock the results
        show_results = 1;
        #10;

        $display("");
        $display("================================");
        $display("     ELECTRONIC VOTING MACHINE");
        $display("================================");
        $display("Candidate 1 Votes = %0d", candidate1_votes);
        $display("Candidate 2 Votes = %0d", candidate2_votes);
        $display("Candidate 3 Votes = %0d", candidate3_votes);
        $display("Candidate 4 Votes = %0d", candidate4_votes);
        $display("================================");

        // Try another vote after results are locked
        show_results = 0;
        #10;
        cast_vote(1);

        $display("After result lock, Candidate 1 Votes = %0d",
                 candidate1_votes);

        $finish;
    end

endmodule
