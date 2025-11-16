import React, { useState } from 'react';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Modal from '../components/Modal';
import { mockPolls as initialPolls } from '../mockData';
import { Poll, PollOption } from '../types';
import { useAuth } from '../context/AuthContext';
import { PlusIcon, TrashIcon, CheckCircleIcon } from '../components/icons';

// NewPollModal Component
const NewPollModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (question: string, options: string[]) => void;
}> = ({ isOpen, onClose, onSubmit }) => {
    const [question, setQuestion] = useState('');
    const [options, setOptions] = useState(['', '']);

    const handleAddOption = () => {
        if (options.length < 5) {
            setOptions([...options, '']);
        }
    };

    const handleRemoveOption = (index: number) => {
        if (options.length > 2) {
            setOptions(options.filter((_, i) => i !== index));
        }
    };

    const handleOptionChange = (index: number, value: string) => {
        const newOptions = [...options];
        newOptions[index] = value;
        setOptions(newOptions);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (question.trim() && options.every(opt => opt.trim())) {
            onSubmit(question, options.map(opt => opt.trim()));
            // Reset form
            setQuestion('');
            setOptions(['', '']);
        } else {
            alert('Please fill out the question and all option fields.');
        }
    };
    
    return (
        <Modal isOpen={isOpen} onClose={onClose} title="Create New Poll">
            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label htmlFor="question" className="block text-sm font-medium text-text-secondary">Poll Question</label>
                    <input type="text" id="question" value={question} onChange={e => setQuestion(e.target.value)} required placeholder="e.g., What should be the new gym hours?" className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md" />
                </div>
                
                {options.map((option, index) => (
                    <div key={index}>
                        <label htmlFor={`option-${index}`} className="block text-sm font-medium text-text-secondary">Option {index + 1}</label>
                        <div className="flex items-center space-x-2">
                            <input type="text" id={`option-${index}`} value={option} onChange={e => handleOptionChange(index, e.target.value)} required placeholder={`Option ${index + 1}`} className="mt-1 w-full px-3 py-2 bg-background border border-border rounded-md" />
                            {options.length > 2 && (
                                <button type="button" onClick={() => handleRemoveOption(index)} className="p-2 text-red-500 hover:bg-gray-700 rounded-full transition-colors">
                                    <TrashIcon className="h-5 w-5" />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
                
                {options.length < 5 && (
                    <button type="button" onClick={handleAddOption} className="flex items-center text-sm text-primary hover:underline">
                        <PlusIcon className="h-4 w-4 mr-1" /> Add Option
                    </button>
                )}

                <div className="flex justify-end space-x-4 pt-4 border-t border-border mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded-md text-sm font-medium text-text-secondary bg-gray-700 hover:bg-gray-600 transition-transform duration-150 active:scale-95">Cancel</button>
                    <button type="submit" className="px-4 py-2 rounded-md text-sm font-medium text-white bg-primary hover:bg-primary-hover transition-transform duration-150 active:scale-95">Create Poll</button>
                </div>
            </form>
        </Modal>
    );
};

// Enhanced PollCard Component
const PollCard: React.FC<{
    poll: Poll;
    onVote: (pollId: string, optionId: string) => void;
    userId: string;
}> = ({ poll, onVote, userId }) => {
    const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

    const hasPersistentlyVoted = poll.votedBy.includes(userId);
    
    const handleVote = (optionId: string) => {
        if (!hasPersistentlyVoted && !selectedOptionId) {
            setSelectedOptionId(optionId);
            onVote(poll.id, optionId);
        }
    };

    const isPollClosed = !poll.isActive;
    const showResults = isPollClosed || hasPersistentlyVoted || selectedOptionId;

    const renderOption = (option: PollOption) => {
        const isSelectedByUser = selectedOptionId === option.id;
        
        const totalVotes = poll.totalVotes;
        const currentVotes = option.votes;
        const percentage = totalVotes > 0 ? ((currentVotes / totalVotes) * 100) : 0;

        if (showResults) {
            return (
                <div key={option.id} className="space-y-1">
                    <div className="flex justify-between text-sm items-center">
                        <span className="font-medium text-text-primary flex items-center">
                            {option.text}
                            {isSelectedByUser && <CheckCircleIcon className="h-5 w-5 text-green-400 ml-2"/>}
                        </span>
                        <span className="text-text-secondary">{currentVotes} votes ({percentage.toFixed(0)}%)</span>
                    </div>
                    <div className="w-full bg-background rounded-full h-3 overflow-hidden">
                        <div 
                            className={`${isSelectedByUser ? 'bg-green-500' : 'bg-primary'} h-3 rounded-full transition-all duration-500 ease-out`}
                            style={{ width: `${percentage}%` }}
                        ></div>
                    </div>
                </div>
            );
        }

        return (
             <button
                key={option.id}
                onClick={() => handleVote(option.id)}
                className="w-full text-left p-3 border border-border rounded-md hover:bg-gray-700 transition-all duration-150 active:scale-95 text-text-primary"
            >
                {option.text}
            </button>
        );
    };

    return (
        <Card className="flex flex-col">
            <div className="flex justify-between items-start mb-4">
                 <h3 className="text-lg font-semibold text-text-primary flex-1 pr-4">{poll.question}</h3>
                 {!poll.isActive && (
                    <span className="flex-shrink-0 px-2 py-1 text-xs font-semibold rounded-full bg-yellow-500 text-yellow-50">
                        Closed
                    </span>
                 )}
            </div>
            <div className="space-y-3 flex-grow">
                {poll.options.map(renderOption)}
            </div>
             <div className="mt-4 text-sm text-text-secondary border-t border-border pt-3">
                Total Votes: {poll.totalVotes}
            </div>
        </Card>
    );
}

// Main Polls Page Component
const Polls: React.FC = () => {
    const { user, isAdmin } = useAuth();
    const [polls, setPolls] = useState<Poll[]>(initialPolls);
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleVote = (pollId: string, optionId: string) => {
        if(!user) return;
        setPolls(currentPolls => 
            currentPolls.map(poll => {
                if (poll.id === pollId && !poll.votedBy.includes(user.id)) {
                    return {
                        ...poll,
                        totalVotes: poll.totalVotes + 1,
                        options: poll.options.map(opt => 
                            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
                        ),
                        votedBy: [...poll.votedBy, user.id]
                    };
                }
                return poll;
            })
        );
    };

    const handleCreatePoll = (question: string, optionsText: string[]) => {
        const newPoll: Poll = {
            id: `p${polls.length + 1}${Date.now()}`,
            question,
            isActive: true,
            options: optionsText.map((text, index) => ({
                id: `o${Date.now()}${index}`,
                text,
                votes: 0
            })),
            totalVotes: 0,
            votedBy: []
        };
        setPolls([newPoll, ...polls]);
        setIsModalOpen(false);
    };
    
    if (!user) {
        // This view is protected, but as a fallback:
        return <div className="text-center p-8">Loading user information...</div>;
    }

    return (
        <div>
            <PageHeader 
                title="Polls & Voting" 
                actionText={isAdmin ? "Add New Poll" : undefined}
                onActionClick={isAdmin ? () => setIsModalOpen(true) : undefined}
            />

            <NewPollModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleCreatePoll}
            />

            {polls.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {polls.map((poll) => (
                        <PollCard key={poll.id} poll={poll} onVote={handleVote} userId={user.id} />
                    ))}
                </div>
            ) : (
                <Card className="text-center py-12">
                    <h3 className="text-xl font-semibold">No active polls</h3>
                    <p className="text-text-secondary mt-2">Check back later for new polls, or create one if you're an admin.</p>
                </Card>
            )}
        </div>
    );
};

export default Polls;