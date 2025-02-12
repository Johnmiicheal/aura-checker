'use client'

import { useEffect, useState, ReactNode, useRef } from 'react'
import { useChat } from 'ai/react'
import { motion } from 'framer-motion'
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import Marked, { ReactRenderer } from 'marked-react'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import Image from 'next/image'
import toast from 'react-hot-toast'
import Logo from '@/assets/Logo.png'
import { CardTopLeftCover, CardTopRightCover } from '@/assets/CardTopCover'
import { CardLeftSideCover, CardRightSideCover } from '@/assets/CardSideCover'
import { CardLeftSideHandles, CardRightSideHandles } from '@/assets/CardSideHandles'
import ShareButton from '@/components/ShareButton'
import { getAuraScores, createShareableLink } from './actions'
import { toPng } from 'html-to-image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface Models {
  name: string
  modelId: string
  description: string
  icon: string
}

const loadingMessages = [
  "Fetching @{user} and @{subject}'s recent tweets...",
  "Analyzing engagement patterns and posting frequency...",
  "Calculating aura compatibility scores...",
  "Evaluating communication styles and interests...",
  "Comparing interaction patterns...",
  "Generating detailed compatibility report..."
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
    <div className="overflow-x-auto !my-4 rounded-xl border border-[#2E3547]">
      <table className="w-full border-collapse bg-[#1F2433]/50 backdrop-blur-sm !m-0">
        {children}
      </table>
    </div>
  ),
  tableHeader: (children: ReactNode) => (
    <thead>
      {children}
    </thead>
  ),
  tableBody: (children: ReactNode) => (
    <tbody>
      {children}
    </tbody>
  ),
  tableRow: (children: ReactNode) => (
    <tr className="!transition-colors hover:!bg-[#2E3547]/30 [&:last-child_td]:border-b-0">
      {children}
    </tr>
  ),
  tableCell: (children: ReactNode[], flags: { header: boolean }) => (
    flags.header ? (
      <th className="!px-4 !py-3 !text-left !text-sm !font-semibold !text-white/90 !tracking-wide !bg-[#2E3547] border-b border-[#2E3547]">
        {children}
      </th>
    ) : (
      <td className="!px-4 !py-3 !text-sm !text-white/80 border-b border-[#2E3547]/70">
        {children}
      </td>
    )
  ),
}

interface HomeProps {
  searchParams?: string;
}

export default function Home({ searchParams }: HomeProps) {
  const router = useRouter()

  // Parse search params once
  const params = searchParams ? new URLSearchParams(searchParams) : null
  const isSharedView = !!params && 
    !!params.get('result') && 
    !!params.get('auraUser') && 
    !!params.get('auraSubject')

  // Initialize state with search params if available
  const [auraUser, setAuraUser] = useState(params?.get('auraUser') || '')
  const [auraSubject, setAuraSubject] = useState(params?.get('auraSubject') || '')
  const [isSubmitted, setIsSubmitted] = useState(isSharedView)
  const [loadingIdx, setLoadingIdx] = useState(0)
  const [scores, setScores] = useState<{ user: number; subject: number; } | null>(
    isSharedView ? {
      user: parseInt(params?.get('userScore') || '0'),
      subject: parseInt(params?.get('subjectScore') || '0')
    } : null
  )
  const [shareId, setShareId] = useState<string | null>(null)
  
  // Refs
  const scrollRef = useRef<HTMLDivElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: '/api/check-aura',
    body: { auraUser, auraSubject },
    initialMessages: params ? [{
      id: 'shared',
      role: 'assistant',
      content: params.get('result') || '',
      reasoning: params.get('reasoning') || ''
    }] : [],
    async onFinish(message) {
      // Generate aura scores based on AI's analysis
      const auraScores = await getAuraScores(message.content);
      setScores(auraScores);

      // Create shareable link
      try {
        const { shareId } = await createShareableLink({
          auraUser,
          auraSubject,
          scores: auraScores,
          result: message.content,
          reasoning: message.reasoning || ''
        })
        setShareId(shareId)
        
        // Route to the share URL
        router.push(`/a/${shareId}`)
      } catch (error) {
        console.error('Error creating share link:', error)
        toast.error('Failed to create shareable link')
      }
    },
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

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSharedView) return;
    if (!input.trim()) return;
    if (!validateUsernames(auraUser, auraSubject)) return;
    setIsSubmitted(true);
    handleSubmit(e);
  };

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

  const getLoadingMessage = () => {
    return loadingMessages[loadingIdx]
      .replace('{user}', auraUser)
      .replace('{subject}', auraSubject);
  }

  const getCardImage = async () => {
    if (!cardRef.current) return null
    
    try {
      return await toPng(cardRef.current, {
        quality: 1.0,
        backgroundColor: '#111827',
        pixelRatio: 2,
        style: {
          transform: 'scale(1)',
          borderRadius: '32px'
        }
      })
    } catch (error) {
      toast.error('Failed to generate image')
      console.error('Image generation error:', error)
      return null
    }
  }

  const getShareUrl = () => {
    return shareId ? `${window.location.origin}/a/${shareId}` : window.location.href
  }

  return (
    <div className="min-h-screen flex flex-col items-center px-2 sm:px-6 py-4 sm:py-20 text-sm md:text-[15px]">
      <div className='w-full flex flex-col items-center relative z-10 max-w-[800px] mx-auto'>
        <div className='relative w-full'>
          <div 
            ref={cardRef}
            className="bg-[#1F2433] backdrop-blur-sm border-[5px] border-[#293040] p-2 sm:p-3 rounded-[24px] sm:rounded-[32px] relative overflow-hidden w-full"
          >
            <div className='w-full flex justify-end pb-2 sm:pb-3 px-2 relative z-30'>
              {!isLoading && scores && (
                <ShareButton getImage={getCardImage} shareId={shareId} getShareUrl={getShareUrl} />
              )}
            </div>

            <motion.div
              animate={{ height: isLoading ? '260px' : '162px' }}
              className='absolute top-0 left-0 w-full flex overflow-visible justify-between z-20'
            >
              <CardTopLeftCover
                preserveAspectRatio='none'
                className={`relative scale-[65%] h-full md:scale-100 origin-top-left shrink-0 ${!isSubmitted ? 'left-0' : '-left-[300px]'} duration-500`}
              />
              <CardTopRightCover
                preserveAspectRatio='none'
                className={`relative h-full scale-[65%] md:scale-100 origin-top-right ${!isSubmitted ? 'right-0' : '-right-[300px]'} duration-500`}
              />
            </motion.div>

            {!isLoading && isSubmitted && (
              <div className='absolute top-0 left-0 w-full flex justify-between h-full overflow-visible z-10'>
                <motion.div
                  initial={{ x: "-200px" }}
                  animate={{ x: "-40px" }}
                  transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                >
                  <CardLeftSideCover className="h-full w-[62px] md:w-auto relative rotate-180" />
                </motion.div>
                <motion.div
                  initial={{ x: "200px" }}
                  animate={{ x: "40px" }}
                  transition={{ duration: 0.5, ease: "easeInOut", delay: 0.2 }}
                >
                  <CardRightSideCover className="h-full w-[62px] md:w-auto relative rotate-180" />
                </motion.div>
              </div>
            )}

            {/* header */}
            <div className='w-full flex flex-col gap-4 sm:gap-6 items-center my-4 sm:my-6'>
              <Image
                src={Logo}
                alt='Aura Logo'
                width={200}
                height={200}
                className='w-16 sm:w-20 h-auto'
              />

              <div className='flex flex-col gap-1 items-center'>
                <h1 className='text-2xl font-light'>Aura Checker</h1>
                <p className='opacity-70 font-light'>Compare your Aura with Twitter posts</p>
              </div>

              {/*  */}
              {isSubmitted && (
                <div className='flex flex-col md:flex-row p-2 sm:p-4 w-full gap-4 sm:gap-8 mt-2 sm:mt-4 max-w-[600px]'>
                  <div className='flex flex-col items-center p-4 rounded-2xl w-full gap-3 relative overflow-hidden'
                       style={{ 
                         background: isLoading ? '#2E3547' : 
                           (scores?.user && scores?.subject && scores.user >= scores.subject) ? 
                           'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' : 
                           '#2E3547' 
                       }}>
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2E3547] via-[#3a4156] to-[#2E3547] animate-shimmer" />
                    )}
                    <p className='text-4xl font-medium relative'>
                      {scores?.user || '--'}
                    </p>
                    <div className='flex flex-col items-center gap-1 relative z-10'>
                      <p className='text-sm text-white/70'>Aura points</p>
                      <p className='text-white/80'>@{auraUser}</p>
                    </div>
                  </div>

                  <div className='flex flex-col items-center p-4 rounded-2xl w-full gap-3 relative overflow-hidden'
                       style={{ 
                         background: isLoading ? '#2E3547' : 
                           (scores?.user && scores?.subject && scores.subject > scores.user) ? 
                           'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' : 
                           '#2E3547' 
                       }}>
                    {isLoading && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#2E3547] via-[#3a4156] to-[#2E3547] animate-shimmer" />
                    )}
                    <p className='text-4xl font-medium relative'>
                      {scores?.subject || '--'}
                    </p>
                    <div className='flex flex-col items-center gap-1 relative z-10'>
                      <p className='text-sm text-white/70'>Aura points</p>
                      <p className='text-white/80'>@{auraSubject}</p>
                    </div>
                  </div>
                </div>
              )}

            </div>

            {/* form */}
            {!isLoading && !isSubmitted && (
              <>
                <form className='flex flex-col gap-2 pt-3 sm:pt-5'>
                  <div className="relative flex gap-0 items-center w-full bg-[#2E3547] rounded-xl px-3 h-12">
                    <span className="shrink-0">Your:</span>
                    <Input
                      placeholder="username"
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
                      placeholder="username"
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

                <button
                  onClick={onSubmit}
                  style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }} 
                  className='max-w-[800px] mt-3 w-full h-12 rounded-xl text-white'
                >
                  Generate Aura Report ++
                </button>
              </>
            )}

            {/* Show the Create Your Own button inside the card when in shared view and no result */}
            {isSharedView && !result && (
              <div className='w-full flex flex-col gap-2 pt-3 sm:pt-5'>
                <Link 
                  href="/"
                  className='w-full h-12 rounded-xl text-white flex items-center justify-center hover:brightness-110 transition-all'
                  style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }}
                >
                  Generate Aura Report ++
                </Link>
              </div>
            )}
          </div>

          {!isLoading && isSubmitted && (
            <div className='w-full flex items-center justify-between absolute top-0 left-0 -z-10'>
              <motion.div
                initial={{ x: "-20px", opacity: 0 }}
                animate={{ x: "-76px", opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
              >
                <CardLeftSideHandles />
              </motion.div>
              <motion.div
                initial={{ x: "20px", opacity: 0 }}
                animate={{ x: "76px", opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeInOut", delay: 0.5 }}
              >
                <CardRightSideHandles />
              </motion.div>
            </div>
          )}
        </div>

        {(isSubmitted && !result) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className='w-full py-6 sm:py-10 p-3 sm:p-4 flex flex-col gap-3 items-center'
          >
            <p className='opacity-60'>{getLoadingMessage()}</p>
            <div className='relative w-full md:max-w-[600px] mx-auto h-3 rounded-full bg-white/10'>
              <motion.div
                className='h-full rounded-full'
                style={{ background: 'linear-gradient(90deg, #939BFF 0%, #5966FE 100%)' }}
                initial={{ width: '0%' }}
                animate={{ width: `${((loadingIdx + 1) / loadingMessages.length) * 100}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </motion.div>
        )}

        {result && (
          <div className='relative pt-6 sm:pt-14 w-full flex flex-col items-center'>
            <div className='flex flex-col gap-3 sm:gap-4 items-center max-w-[900px] w-full'>
              <h2 className='text-xl sm:text-2xl md:text-3xl font-medium md:font-light text-center px-2'>
                Aura Compatibility Report
              </h2>
              <div className='flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4 w-full'>
                <div className='h-8 rounded-full border border-white/15 px-3 sm:px-4 inline-flex items-center gap-2 text-sm text-white/70 whitespace-nowrap'>
                  @{auraUser}
                </div>
                <span className='text-white/50'>x</span>
                <div className='h-8 rounded-full border border-white/15 px-3 sm:px-4 inline-flex items-center gap-2 text-sm text-white/70 whitespace-nowrap'>
                  @{auraSubject}
                </div>
              </div>
            </div>

            <div className='mt-4 sm:mt-10 max-w-[900px] w-full mx-auto text-white/70 tracking-wider font-light leading-5 p-2 sm:p-4'>
              {reasoning && (
                <Accordion
                  collapsible
                  type="single"
                  defaultValue="reasoning"
                  className="mb-8 max-w-2xl mx-auto w-full"
                >
                  <AccordionItem
                    value="reasoning"
                    className="border-none rounded-lg bg-zinc-800/40 backdrop-blur-sm"
                  >
                    <AccordionTrigger className="w-full flex items-center justify-between p-4 text-sm font-medium !text-zinc-100 hover:bg-zinc-800/40 rounded-lg transition-all hover:no-underline">
                      AI Reasoning Process
                    </AccordionTrigger>
                    <AccordionContent className="px-4 pb-4 pt-1">
                      <div className="prose prose-sm sm:prose prose-invert prose-zinc w-full break-words">
                        <Marked value={reasoning} renderer={renderer} />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}
              {result && (
                <div className="prose prose-sm sm:prose prose-invert prose-zinc max-w-2xl mx-auto px-2 break-words">
                  <Marked value={result} renderer={renderer} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}