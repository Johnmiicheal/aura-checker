'use client'

import { useEffect, useState, ReactNode, useRef } from 'react'
import { useChat } from 'ai/react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, Github } from 'lucide-react'
import Marked, { ReactRenderer } from 'marked-react'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import Image from 'next/image'
import { Skeleton } from "@/components/ui/skeleton"
import toast from 'react-hot-toast'
import Logo from '@/assets/Logo.png'
import { CardTopLeftCover, CardTopRightCover } from '@/assets/CardTopCover'
import { CardLeftSideCover, CardRightSideCover } from '@/assets/CardSideCover'
import { CardLeftSideHandles, CardRightSideHandles } from '@/assets/CardSideHandles'

interface Models {
    name: string
    modelId: string
    description: string
    icon: string
}

const models: Models[] = [
    {
        name: "DeepSeek R1 Distill Llama 70b",
        modelId: 'groq:deepseek-r1-distill-llama-70b',
        description: 'Meta Llama 3.3 70b Model',
        icon: '/groq.svg',
    },
    {
        name: 'DeepSeek R1',
        modelId: 'deepseek:deepseek-reasoner',
        description: 'DeepSeek Reasoning Model',
        icon: '/deepseek.svg',
    },
]

const loadingMessages = [
    "Analyzing digital footprint...",
    "Processing social patterns...",
    "Computing compatibility...",
    "Mapping social connections...",
    "Generating insights...",
    "Finalizing report...",
]

const renderer: Partial<ReactRenderer> = {
    heading: (children: ReactNode, level: number) => (
        <h2 className={`text-${level === 1 ? '2xl' : 'xl'} font-medium !text-zinc-100 my-4`}>
            {children}
        </h2>
    ),
    strong: (children: ReactNode) => (
        <strong className="!text-zinc-100 font-semibold">{children}</strong>
    ),
    paragraph: (children: ReactNode) => (
        <p className="text-zinc-300 mb-4 break-words">{children}</p>
    ),
    list: (children: ReactNode, ordered?: boolean) => (
        <ul className={`list-disc pl-4 mb-4 space-y-2 text-zinc-300 ${ordered ? 'list-decimal' : ''}`}>
            {children}
        </ul>
    ),
    listItem: (children: ReactNode) => (
        <li className="text-zinc-300 break-words">{children}</li>
    ),
    table: (children: ReactNode) => (
        <div className="overflow-x-auto -mx-4 sm:mx-0">
            <div className="inline-block min-w-full align-middle">
                <div className="overflow-hidden rounded-lg border border-zinc-700">
                    <table className="min-w-full divide-y divide-zinc-700/50 !m-0">
                        {children}
                    </table>
                </div>
            </div>
        </div>
    ),
    tableHeader: (children: ReactNode) => (
        <thead className="bg-zinc-800/90 !text-zinc-200">
            {children}
        </thead>
    ),
    tableBody: (children: ReactNode) => (
        <tbody className="divide-y !divide-zinc-700/50">
            {children}
        </tbody>
    ),
    tableRow: (children: ReactNode) => (
        <tr className="transition-colors hover:bg-zinc-700/30">
            {children}
        </tr>
    ),
    tableCell: (children: ReactNode[], flags: { header: boolean }) => (
        flags.header ? (
            <th className="px-3 sm:px-6 py-3 sm:py-4 text-left text-xs font-medium tracking-wider !text-zinc-200 uppercase">
                {children}
            </th>
        ) : (
            <td className="px-3 sm:px-6 py-3 sm:py-4 text-sm !text-zinc-200 whitespace-normal break-words">
                {children}
            </td>
        )
    ),
}

export default function Home() {
    const [auraUser, setAuraUser] = useState('')
    const [auraSubject, setAuraSubject] = useState('')
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [loadingIdx, setLoadingIdx] = useState(0)
    const scrollRef = useRef<HTMLDivElement>(null)
    const [selectedModel, setSelectedModel] = useState(models[0].modelId)

    const { messages, input, handleInputChange, handleSubmit, setMessages, stop, isLoading } = useChat({
        api: '/api/check-aura',
        body: { auraUser, auraSubject, model: selectedModel }
    })

    const validateUsernames = (user: string, subject: string) => {
        if (user.toLowerCase() === subject.toLowerCase()) {
            toast.error("Comparing yourself to yourself? That's deep... but try someone else!", {
                style: {
                    background: '#27272a',
                    color: '#fafafa',
                    border: '1px solid #3f3f46',
                },
                iconTheme: {
                    primary: '#71717a',
                    secondary: '#18181b',
                },
            });
            return false;
        }
        return true;
    };

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleanUsername = e.target.value.replace('@', '').trim();
        setAuraUser(cleanUsername);
    };

    const handleSubjectChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const cleanUsername = e.target.value.replace('@', '').trim();
        setAuraSubject(cleanUsername);
    };

    const onSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // if (!input.trim()) return;

        // if (!validateUsernames(auraUser, auraSubject)) return;

        setIsSubmitted(true);
        // handleSubmit(e);
    };

    const resetForm = () => {
        stop()
        setAuraUser('')
        setAuraSubject('')
        setIsSubmitted(false)
        setMessages([])
        setLoadingIdx(0)
    }

    useEffect(() => {
        if (isLoading) {
            const interval = setInterval(() => {
                setLoadingIdx((prev) => (prev + 1) % loadingMessages.length)
            }, 2000)
            return () => clearInterval(interval)
        }
        setLoadingIdx(0)
    }, [isLoading])

    const assistantMessages = messages.filter((m) => m.role === 'assistant')
    const lastAssistantMessage = assistantMessages[assistantMessages.length - 1]
    const streamingReasoning = lastAssistantMessage?.reasoning || ""
    const result = lastAssistantMessage?.content || ""
    const reasoning = streamingReasoning

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, result])

    return (
        <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 py-20 text-sm md:text-[15px]">

            <div className='w-full flex flex-col items-center relative z-10'>
                <div className='relative w-full md:max-w-[800px]'>
                    <div className="bg-[#1F2433] backdrop-blur-sm border-[5px] border-[#293040] p-3 pt-2 rounded-[32px] relative overflow-hidden">

                        {!isSubmitted && (
                            <div className='absolute top-0 left-0 w-full flex justify-between h-0 overflow-visible'>
                                <CardTopLeftCover className={`scale-[65%] md:scale-100 origin-top-left ${isSubmitted ? '' : ''}`} />
                                <CardTopRightCover className='relative -right-1 scale-[65%] md:scale-100 origin-top-right' />
                            </div>
                        )}

                        {isSubmitted && (
                            <div className='absolute top-0 left-0 w-full flex justify-between h-full overflow-visible'>
                                <CardLeftSideCover className={`h-full w-[62px] md:w-auto relative -left-10 md:-left-14 rotate-180`} />
                                <CardRightSideCover className={`h-full w-[62px] md:w-auto relative -right-10 md:-right-14 rotate-180`} />
                            </div>
                        )}

                        {/* header */}
                        <div className='w-full flex flex-col gap-6 items-center mt-6'>
                            <Image
                                src={Logo}
                                alt='Aura Logo'
                                width={200}
                                height={200}
                                className='w-20 h-auto'
                            />

                            <div className='flex flex-col gap-1 items-center'>
                                <h1 className='text-2xl font-light'>Aura Checker</h1>
                                <p className='opacity-70 font-light'>Compare your Aura with Twitter posts</p>
                            </div>

                            {/*  */}
                            {isSubmitted && (
                                <div className='flex flex-col md:flex-row p-4 w-full gap-8 mt-4 max-w-[600px]'>
                                    <div className='flex flex-col items-center p-4 bg-[#2E3547] rounded-2xl w-full gap-3'>
                                        <p className='text-4xl font-medium'>75</p>
                                        <div className='flex flex-col items-center gap-1'>
                                            <p className='text-sm text-[#B1B6C0] opacity-60'>Aura points</p>
                                            <p className='opacity-60'>@kartik_builds</p>
                                        </div>
                                    </div>

                                    <div className='flex flex-col items-center p-4 bg-[#2E3547] rounded-2xl w-full gap-3' style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }}>
                                        <p className='text-4xl font-medium'>90</p>
                                        <div className='flex flex-col items-center gap-1'>
                                            <p className='text-sm opacity-70'>Aura points</p>
                                            <p>@kartik_builds</p>
                                        </div>
                                    </div>
                                </div>
                            )}


                        </div>

                        {/* form */}
                        {!isSubmitted && (
                            <form action="" className='flex flex-col gap-2 pt-10'>
                                <div className="relative flex gap-0 items-center w-full bg-[#2E3547] rounded-xl px-3 h-12">
                                    <span className="shrink-0">Your:</span>
                                    <Input
                                        placeholder="@username"
                                        value={auraUser}
                                        onChange={handleUserChange}
                                        className="border-none placeholder:text-[#8B929F] focus-visible:ring-0 px-2"
                                        aria-label="Your X(Twitter) username"
                                    />
                                    <span className="absolute right-4 text-[#B1B6C0] opacity-70 text-xs font-medium">{`(X/Twitter)`}</span>
                                </div>

                                <div className="relative flex gap-0 items-center w-full bg-[#2E3547] rounded-xl px-3 h-12">
                                    <span className="shrink-0">Their:</span>
                                    <Input
                                        placeholder="@username"
                                        value={auraSubject}
                                        onChange={handleSubjectChange}
                                        className="border-none placeholder:text-[#8B929F] focus-visible:ring-0 px-2"
                                        aria-label="Their X(Twitter) username"
                                    />
                                    <span className="absolute right-4 text-[#B1B6C0] opacity-70 text-xs font-medium">{`(X/Twitter)`}</span>
                                </div>

                                <div className="relative flex gap-0 w-full bg-[#2E3547] rounded-xl p-3">
                                    <Textarea
                                        placeholder="Describe anything you may have in common..."
                                        value={input}
                                        onChange={handleInputChange}
                                        className="border-none placeholder:text-[#8B929F] focus-visible:ring-0 p-0 min-h-20 resize-none"
                                        aria-label="Describe your situation"
                                    ></Textarea>
                                </div>

                            </form>
                        )}

                    </div>
                    {isSubmitted && (
                        <div className='w-full flex flex-col items-center'>
                            <CardLeftSideHandles className='absolute top-0 -left-[76px] -z-10' />
                            <CardRightSideHandles className='absolute top-0 -right-[76px] -z-10' />
                        </div>
                    )}
                </div>


                {!isSubmitted && (
                    <button onClick={onSubmit} style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }} className='max-w-[600px] mt-3 w-full h-12 rounded-xl text-white'>
                        Generate Aura Report ++
                    </button>
                )}

                {!isSubmitted && (
                    <div className='w-full py-10 p-4 flex flex-col gap-3 items-center'>
                        <p className='opacity-60'>Generating Report...</p>
                        <div className='relative w-full md:max-w-[600px] mx-auto h-3 rounded-full bg-white/10'>
                            <div
                                className='w-[75%] h-full rounded-full' style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }}
                            />
                        </div>

                    </div>
                )}

                {isSubmitted && (
                    <div className='relative pt-14'>

                        {/* result header */}
                        <div className='flex flex-col gap-4 items-center'>
                            <h2 className='text-2xl md:text-3xl font-medium md:font-light'>Aura Compatibility Report</h2>
                            <div className='flex items-center gap-4'>
                                <div className='h-8 rounded-full border border-white/15 px-4 inline-flex items-center gap-2 text-sm text-white/70'>
                                    @kartik_builds
                                </div>
                                <span className='text-white/50'>x</span>
                                <div className='h-8 rounded-full border border-white/15 px-4 inline-flex items-center gap-2 text-sm text-white/70'>
                                    @elonmusk
                                </div>
                            </div>
                        </div>

                        {/* result body */}
                        <div className='mt-10 max-w-[900px] text-white/70 tracking-wider font-light leading-5 p-2'>
                            <p>
                                First, I'll look at @kartik_builds. From the posts provided, it seems like Kartik is a Design Engineer focused on AI and building products like Supermemoryai. He shares a lot about his projects, progress, and even some personal updates like joining as a co-founder. His posts often include emojis and hashtags, which gives a sense of enthusiasm and engagement. He also interacts with others, like giving shoutouts and collaborating, which shows he's connected and supportive. There are some posts where he expresses frustration, like being tired of remote work, but overall, his feed is positive and focused on growth and building things.
                            </p>
                        </div>

                    </div>
                )}
            </div>

        </div>
    )
}